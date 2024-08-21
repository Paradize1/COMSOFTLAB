$(document).ready(function() {
    $('#loading-indicator').show(); // Показываем индикатор загрузки

    // Устанавливаем этапы загрузки
    var stages = [
        "Получаем данные...",
        "Сравниваем с базой данных...",
        "Загружаем в таблицу..."
    ];
    var currentStage = 0;

    function updateProgressBar(percentage) {
        $('#progress-bar').css('width', percentage + '%');
    }

    function updateLoadingMessage(message) {
        $('#loading-message').text(message);
    }

    // Функция для обновления прогресс-бара и сообщения
    function progressUpdate(stage, percentage) {
        updateLoadingMessage(stages[stage]);
        updateProgressBar(percentage);
    }


    // Функция для экранирования HTML
    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}





    $.ajax({
        url: messageListUrl,  // Убедитесь, что URL соответствует вашему URL-роуту
        method: "GET",
        dataType: "json",
        beforeSend: function() {
            progressUpdate(0, 0); // Начало загрузки
        },
        success: function(data) {
            var tbody = $('#messages-table tbody');
            console.log("Данные получены:", data);

            // Обновляем прогресс до 33% (Получаем данные)
            setTimeout(function() {
                progressUpdate(1, 33);

                // Имитируем задержку для демонстрации
                setTimeout(function() {
                    // Обновляем прогресс до 66% (Сравниваем с базой данных)
                    progressUpdate(2, 66);

                    // Обновляем таблицу с данными
                    data.messages.forEach(function(message) {
                        var row = '<tr>' +
                            '<td>' + message.id + '</td>' +
                            '<td>' + message.sender + '</td>' +
                            '<td>' + message.date + '</td>' +
                            '<td>' + message.subject + '</td>' +
                            '<td><button class="view-description" data-full-text="' + escapeHtml(message.description) + '">Посмотреть описание</button></td>' +
                            '</tr>';
                        tbody.append(row);
                    });

                    // Обновляем прогресс до 100% (Загружаем в таблицу)
                    setTimeout(function() {
                        progressUpdate(3, 100);
                        $('#loading-indicator').hide(); // Скрываем индикатор загрузки
                    }, 500); // Задержка 0.5 секунды перед скрытием
                }, 1000); // Задержка 1 секунда для демонстрации
            }, 500); // Задержка 0.5 секунды для демонстрации
        },
        error: function() {
            console.error("Ошибка загрузки данных.");
            $('#loading-indicator').hide(); // Скрываем индикатор даже в случае ошибки
        }
    });

// Обработчик клика по кнопке "Посмотреть описание"
$('#messages-table').on('click', '.view-description', function() {
    var fullText = $(this).data('full-text'); // Получаем полное описание из атрибута data-full-text
    $('#modal-description').html(fullText); // Используем .html() для вставки HTML-кода
    $('#modal').show(); // Показываем модальное окно
});

// Обработчик клика по кнопке закрытия модального окна
$('.close-btn').on('click', function() {
    $('#modal').hide(); // Скрываем модальное окно
});

// Закрытие модального окна при клике вне его
$(window).on('click', function(event) {
    if ($(event.target).is('#modal')) {
        $('#modal').hide(); // Скрываем модальное окно, если кликнули вне его
    }
});


});
