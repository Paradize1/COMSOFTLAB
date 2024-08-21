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

            # 1. Удаление текста в скобках из отправителя
            cleaned_sender = re.sub(r'\s*<[^>]+>', '', sender).strip()

            # 2. Нормализация и очистка текста описания
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