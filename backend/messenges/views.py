from django.shortcuts import render
from django.http import JsonResponse
from .utils import fetch_all_messages, save_messages_to_db
from .models import Message

def message_list(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        all_messages = fetch_all_messages()  # Берём первые 10 сообщений

        # Рассчитываем статистику до сохранения данных в базе данных
        total_messages = len(all_messages)
        db_message_count = Message.objects.count()
        duplicates = len(all_messages) - len(set(all_messages))  # Оценка совпадающих
        unique = len(set(all_messages))

        stats = {
            'total': total_messages,
            'db': db_message_count,
            'duplicates': duplicates,
            'unique': unique,
        }

        # Сохраняем сообщения в базе данных
        save_messages_to_db(all_messages)

        data = [
            {
                'id': idx + 1,
                'sender': message[1],
                'date': message[2].strftime('%d-%m-%Y %H:%M:%S'),
                'subject': message[0],
                'description': message[3]
            }
            for idx, message in enumerate(all_messages)
        ]
        return JsonResponse({'messages': data, 'stats': stats})

    return render(request, 'home.html')




