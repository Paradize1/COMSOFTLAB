from django.shortcuts import render
from django.http import JsonResponse
from .utils import fetch_all_messages  # Импортируем основную функцию


def message_list(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        all_messages = fetch_all_messages()[:10]  # Берем первые 10 сообщений
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
        return JsonResponse({'messages': data})

    return render(request, 'home.html')




