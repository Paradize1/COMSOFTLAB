import time
import re
from datetime import datetime
from .fetches.yandex_fetch import yandex_fetch
from .fetches.mailru_fetch import mailru_fetch
from .models import EmailAccount, Message
from django.utils.dateparse import parse_datetime
import unicodedata

def get_credentials(service_name):
    try:
        account = EmailAccount.objects.get(service=service_name)
        return {
            "email": account.email,
            "password": account.password
        }
    except EmailAccount.DoesNotExist:
        return None

mailru_credentials = get_credentials('mail.ru')
yandex_credentials = get_credentials('yandex')

def fetch_all_messages():
    if not yandex_credentials or not mailru_credentials:
        raise ValueError("Не удалось получить учетные данные для одного или нескольких сервисов.")

    start_time = time.time()  # Начало измерения времени

    yandex_messages = yandex_fetch(yandex_credentials['email'], yandex_credentials['password'])
    mailru_messages = mailru_fetch(mailru_credentials['email'], mailru_credentials['password'])

    def final_processing(messages):
        processed_messages = []

        for message in messages:
            subject, sender, date, description = message

            cleaned_sender = re.sub(r'\s*<[^>]+>', '', sender).strip()
            description = unicodedata.normalize('NFKC', description)  # Приведение текста к стандартной форме
            cleaned_description = re.sub(r'[\u200c\u200b\u200d\u2060\u00a0]+', ' ', description)  # Удаление специальных символов
            cleaned_description = re.sub(r'\s+', ' ', cleaned_description)  # Сокращение множественных пробелов до одного пробела
            cleaned_description = cleaned_description.strip()  # Удаление пробелов в начале и конце

            # Добавляем обработанное сообщение в новый список
            processed_messages.append((subject, cleaned_sender, date, cleaned_description))

        return processed_messages

    # Объединяем все сообщения в один список
    all_messages = yandex_messages + mailru_messages

    # Применяем финальную обработку
    all_messages = final_processing(all_messages)

    end_time = time.time()  # Конец измерения времени
    elapsed_time = end_time - start_time  # Время выполнения

    # Выводим информацию в консоль
    print(f"Получено сообщений: {len(all_messages)}")
    print(f"Время загрузки и обработки: {elapsed_time:.2f} секунд")

    return all_messages




#------------------------------------------------------------#
    # Сохраняем сообщения в базе данных
def save_messages_to_db(messages):
    saved_count = 0

    # Получаем учетные данные
    mailru_credentials = get_credentials('mail.ru')
    yandex_credentials = get_credentials('yandex')
    
    
    # Создаем словарь для быстрого доступа к учетным записям
    email_accounts = {
        'mail.ru': mailru_credentials['email'] if mailru_credentials else None,
        'yandex': yandex_credentials['email'] if yandex_credentials else None
    }

    for subject, sender, date, description in messages:
        try:
            # Определяем сервис по отправителю
            account_service = None
            for service, email in email_accounts.items():
                account_service = service
                break

            if account_service is None:
                print(f"Не удалось определить сервис для отправителя: {sender}")
                continue

            # Получаем EmailAccount для найденного сервиса
            try:
                account = EmailAccount.objects.get(service=account_service)
            except EmailAccount.DoesNotExist:
                print(f"EmailAccount не найден для сервиса: {account_service}")
                continue
            
            # Проверяем, является ли date строкой и преобразуем, если необходимо
            if isinstance(date, str):
                received_date = parse_datetime(date)
                if received_date is None:
                    print(f"Ошибка: не удалось разобрать дату: {date}")
                    continue
            elif isinstance(date, datetime):
                received_date = date
            else:
                print(f"Ошибка: дата не является строкой или datetime: {date}")
                continue
            
            # Проверка на существование сообщения с теми же параметрами
            if Message.objects.filter(account=account, subject=subject, received_date=received_date).exists():
                continue

            # Создаем и сохраняем объект сообщения
            Message.objects.create(
                account=account,
                subject=subject,
                received_date=received_date,
                text=description,
                sent_date=None  
            )
            saved_count += 1
        except Exception as e:
            print(f"Ошибка при сохранении сообщения: {e}")

    print(f"Сохранено сообщений в базе данных: {saved_count}")




def calculate_statistics(all_messages, saved_count):
 
    yandex_messages = yandex_fetch(yandex_credentials['email'], yandex_credentials['password'])
    mailru_messages = mailru_fetch(mailru_credentials['email'], mailru_credentials['password'])
 
 
 
    total_messages = len(all_messages)
    db_message_count = Message.objects.count()
    duplicates = total_messages - saved_count
    unique_messages = total_messages - duplicates
    total_yandex = len(yandex_messages) 
    total_mailru = len(mailru_messages) 

    print('Всего сообщений', total_messages)
    print('В базе данных',db_message_count)
    print('Совпадений',duplicates)
    print('Уникальных',unique_messages)
    print('Получено с яндекса',total_yandex)
    print('получено с мейлру',total_mailru)



    # return {
    #     'total_messages': total_messages,
    #     'db_message_count': db_message_count,
    #     'duplicates': duplicates,
    #     'unique_messages': unique_messages,
    #     'total_yandex': total_yandex,
    #     'total_mailru': total_mailru,
    # }