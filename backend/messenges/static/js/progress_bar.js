


document.addEventListener('DOMContentLoaded', () => {

    console.log('progress_bar loaded')

    const progressBar = document.getElementById('progress-bar');
    const progressBarContainer = document.querySelector('.progress-bar-container');

    if (!progressBar || !progressBarContainer) {
        return;
    }

    // Обновляем текст и ширину прогресс-бара
    function updateProgress(text, width) {
        progressBar.setAttribute('data-text', text);
        progressBar.style.width = width;
    }

    // Начинаем процесс загрузки данных
    function startLoading() {
        updateProgress('Получаю данные о сообщениях', '30%');
    }

    // Завершаем процесс загрузки данных
    function finishLoading() {
        updateProgress('Вывожу информацию в таблицу', '70%');
    }

    // Завершаем обновление и скрываем прогресс-бар
    function complete() {
        updateProgress('Загрузка завершена', '100%');
        setTimeout(() => {
            progressBarContainer.style.display = 'none';
        }, 500);
    }

    // Обработчик кликов по ссылкам пагинации с прогресс-баром
    document.querySelectorAll('.pagination a').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();

            // Показать прогресс-бар
            progressBarContainer.style.display = 'block';

            // Обновляем состояние прогресс-бара
            startLoading();

            // Получаем URL из атрибута href ссылки
            const url = this.getAttribute('href');

            // Выполняем AJAX запрос
            fetch(url)
                .then(response => {
                    finishLoading();
                    return response.text();
                })
                .then(html => {
                    // Обновляем содержимое таблицы и пагинации
                    document.querySelector('.container').innerHTML = new DOMParser().parseFromString(html, 'text/html').querySelector('.container').innerHTML;
                    complete();
                })
                .catch(error => {
                    console.error('Ошибка при загрузке данных:', error);
                    updateProgress('Ошибка загрузки данных', '100%');
                    setTimeout(() => {
                        progressBarContainer.style.display = 'none';
                    }, 2000);
                });
        });
    });
});
