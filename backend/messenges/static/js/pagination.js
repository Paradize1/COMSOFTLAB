



document.addEventListener('DOMContentLoaded', () => {

    console.log('paginator loaded')
    // Обработчик кликов по ссылкам пагинации
    document.querySelectorAll('.pagination a').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();

            // Получаем URL из атрибута href ссылки
            const url = this.getAttribute('href');

            // Выполняем AJAX запрос
            fetch(url)
                .then(response => response.text())
                .then(html => {
                    // Обновляем содержимое таблицы и пагинации
                    document.querySelector('.container').innerHTML = new DOMParser().parseFromString(html, 'text/html').querySelector('.container').innerHTML;
                })
                .catch(error => console.error('Ошибка при загрузке данных:', error));
        });
    });
});