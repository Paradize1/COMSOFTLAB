from django.core.paginator import Paginator
from django.shortcuts import render
from .utils import fetch_all_messages  # Импортируем основную функцию


def message_list(request):
    # Получаем все сообщения с разных почтовых сервисов
    all_messages = fetch_all_messages()

    # Создаем объект Paginator
    paginator = Paginator(all_messages, 10)  # 10 сообщений на страницу

    # Получаем номер текущей страницы из запроса
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # Передаем сообщения и объект страницы в контекст шаблона
    return render(request, 'home.html', {'page_obj': page_obj})