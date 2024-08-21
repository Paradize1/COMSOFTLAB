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

    $.ajax({
        url: messageListUrl,  // Убедитесь, что URL соответствует вашему URL-роуту
        method: "GET",
        dataType: "json",
        beforeSend: function() {
            progressUpdate(0, 0); // Начало загрузки
        },
        success: function(data) {
            var tbody = $('#messages-table tbody');

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
                            '<td>' + message.description + '</td>' +
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
});
