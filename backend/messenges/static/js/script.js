$(document).ready(function() {
    $('#loading-indicator').show(); // Показываем индикатор загрузки

    // Устанавливаем этапы загрузки
    var stages = [
        "Получаем данные...",
        "Поиск сообщений...",
        "Загружаем в таблицу..."
    ];

    var stageDurations = [500, 1000, 500]; // Длительность этапов в миллисекундах
    var totalDuration = stageDurations.reduce((a, b) => a + b, 0); // Общее время загрузки

    var currentStage = 0;
    var startTime = new Date().getTime(); // Время начала загрузки

    function updateProgressBar(percentage) {
        $('#progress-bar').css('width', percentage + '%');
    }

    function updateLoadingMessage(message) {
        $('#loading-message').text(message);
    }

    function updateCountdown(remainingTime) {
        $('#countdown').text('Осталось: ' + Math.ceil(remainingTime / 1000) + ' сек');
    }

    function progressUpdate(stage, percentage) {
        updateLoadingMessage(stages[stage]);
        updateProgressBar(percentage);
        // Запускаем таймер отсчета только во время загрузки в таблицу
        if (stage === 2 && !$('#countdown').text()) {
            startCountdown();
        }
    }

    function startCountdown() {
        var interval = setInterval(function() {
            var elapsedTime = new Date().getTime() - startTime;
            var remainingTime = totalDuration - elapsedTime;

            if (remainingTime <= 0) {
                remainingTime = 0;
                clearInterval(interval);
            }

            updateCountdown(remainingTime);
        }, 1000);
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



    //-----------------------------------------\\


    $.ajax({
        url: messageListUrl,
        method: "GET",
        dataType: "json",
        beforeSend: function() {
            progressUpdate(0, 0); // Начало загрузки
        },
        success: function(data) {
            var tbody = $('#messages-table tbody');
            console.log("Данные получены:", data);

            // Обновляем статистику
            $('#total-messages').text(data.stats.total);
            $('#db-messages').text(data.stats.db);
            $('#duplicate-messages').text(data.stats.duplicates);
            $('#unique-messages').text(data.stats.unique);

            // Обновляем прогресс до 33% (Поиск сообщений)
            progressUpdate(1, 33);

            // Обновляем таблицу с данными
            var messages = data.messages;
            var totalMessages = messages.length;
            var index = 0;

            function addRow() {
                if (index < totalMessages) {
                    var message = messages[index];
                    var row = '<tr>' +
                        '<td>' + message.id + '</td>' +
                        '<td>' + message.sender + '</td>' +
                        '<td>' + message.date + '</td>' +
                        '<td>' + message.subject + '</td>' +
                        '<td><button class="view-description" data-full-text="' + escapeHtml(message.description) + '">Посмотреть описание</button></td>' +
                        '</tr>';
                    tbody.append(row);

                    index++;
                    // Переход к следующему сообщению через небольшой интервал
                    setTimeout(addRow, 100); // Можно изменить интервал для настройки скорости
                } else {
                    // Завершаем заполнение таблицы
                    clearInterval(interval); // Останавливаем таймер
                    updateCountdown(0); // Обновляем таймер до 0
                    progressUpdate(2, 100); // Устанавливаем финальную надпись
                    $('#loading-indicator').hide(); // Скрываем индикатор загрузки
                }
            }

            // Запуск добавления строк
            progressUpdate(2, 66); // Начало загрузки в таблицу
            addRow();
        },
        error: function() {
            console.error("Ошибка загрузки данных.");
            $('#loading-indicator').hide(); // Скрываем индикатор даже в случае ошибки
        }
    });



    //--------------------------------------------\\



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
