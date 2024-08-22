$(document).ready(function() {
    $('#loading-indicator').show(); 

    // Устанавливаем этапы загрузки
    var stages = [
        "Получаем данные с Яндекса...",
        "Получаем данные с Mail.ru...",
        "Обрабатываем данные...",
        "Загружаем в таблицу..."
    ];

    var totalStages = stages.length;
    var currentStage = 0;
    var startTime = new Date().getTime(); // Время начала загрузки
    var estimatedTotalTime = 3000; // Оценочное общее время загрузки в миллисекундах

    function updateProgressBar(percentage) {
        $('#progress-bar').css('width', percentage + '%');
    }

    function updateLoadingMessage(message) {
        $('#loading-message').text(message);
    }

    function updateCountdown(remainingTime) {
        $('#countdown').text('Осталось: ' + Math.ceil(remainingTime / 1000) + ' сек');
    }

    function startCountdown(totalTime) {
        var interval = setInterval(function() {
            var elapsedTime = new Date().getTime() - startTime;
            var remainingTime = totalTime - elapsedTime;

            if (remainingTime <= 0) {
                remainingTime = 0;
                clearInterval(interval);
            }

            updateCountdown(remainingTime);
        }, 1000);
    }

    function progressUpdate(stage, percentage, duration) {
        updateLoadingMessage(stages[stage]);
        updateProgressBar(percentage);

        if (stage === totalStages - 1) {
            startCountdown(duration); // Запускаем таймер отсчета во время загрузки в таблицу
        }
    }

    // Инициализируем прогресс
    progressUpdate(0, 0, estimatedTotalTime);



    //-----------------------------------------\\


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
            progressUpdate(0, 0, estimatedTotalTime); 
        },
        success: function(data) {
            var tbody = $('#messages-table tbody');
            console.log("Данные получены:", data);

            // Этап 1: Получение данных с Яндекса
            setTimeout(function() {
                progressUpdate(1, 25, estimatedTotalTime);
            }, 500);

            // Этап 2: Получение данных с Mail.ru
            setTimeout(function() {
                progressUpdate(2, 50, estimatedTotalTime);
            }, 1000);

            // Этап 3: Обработка данных
            setTimeout(function() {
                progressUpdate(3, 75, estimatedTotalTime);
            }, 1500);

            // Этап 4: Загрузка данных в таблицу
            setTimeout(function() {
                progressUpdate(4, 100, estimatedTotalTime);
                updateCountdown(0); // Обновляем таймер до 0
                $('#loading-indicator').hide(); // Скрываем индикатор загрузки

                // Загрузка данных в таблицу
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
                        setTimeout(addRow, 100); 
                    } 
                }

                addRow();
            }, 2000);
        },
        error: function() {
            console.error("Ошибка загрузки данных.");
            $('#loading-indicator').hide(); 
        }
    });



    //--------------------------------------------\\



    // Обработчик клика по кнопке "Посмотреть описание"
    $('#messages-table').on('click', '.view-description', function() {
        var fullText = $(this).data('full-text'); 
        $('#modal-description').html(fullText);
        $('#modal').show(); 
    });

    $('.close-btn').on('click', function() {
        $('#modal').hide(); 
    });

    $(window).on('click', function(event) {
        if ($(event.target).is('#modal')) {
            $('#modal').hide(); 
        }
    });
});
