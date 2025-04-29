// !!! ВСТАВЬ СЮДА URL ТВОЕГО ВЕБ-ПРИЛОЖЕНИЯ GOOGLE APPS SCRIPT !!!
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzW9NIToZDG8gPoeg1qlCO0xCXtjJhKXvrif4mTW6WSfkzAOmSX98kcRwXg8CBx3FBZtQ/exec';

const form = document.getElementById('expenseForm');
const submitButton = document.getElementById('submitButton');
const statusMessage = document.getElementById('statusMessage');

submitButton.addEventListener('click', function(e) {
    e.preventDefault(); // Хотя для button type="button" preventDefault не обязателен
    console.log('Кнопка "Добавить" нажата!');

    // Блокируем кнопку и показываем статус
    submitButton.disabled = true;
    showStatus("Отправка данных...", "info"); // "info" - просто для стилизации или логгирования

    // Собираем данные из формы
    const formData = new FormData(form);
    const dataToSend = {
        who: formData.get('who'),
        amount: formData.get('amount'),
        category: formData.get('category'),
        comment: formData.get('comment')
    };

    // Отправляем данные асинхронно с помощью Fetch API
    fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Указываем, что шлем JSON
        },
        body: JSON.stringify(dataToSend) // Преобразуем объект JS в JSON-строку
    })
    .then(response => {
        // Проверяем, успешно ли прошел сам HTTP-запрос
        if (!response.ok) {
            // Если HTTP-статус ошибки (4xx, 5xx), пытаемся прочитать текст ошибки
            return response.text().then(text => {
                throw new Error(`HTTP ошибка! Статус: ${response.status}. Сообщение: ${text || 'Нет дополнительной информации'}`);
            });
        }
         // Если все ок с HTTP, парсим JSON-ответ от Apps Script
        return response.json();
    })
    .then(data => {
        // Анализируем ответ от нашего скрипта Apps Script
        if (data.status === "success") {
            showStatus("Успешно добавлено!", "success");
            form.reset(); // Очищаем форму
        } else {
            // Показываем сообщение об ошибке, которое вернул скрипт
            showStatus(`Ошибка скрипта: ${data.message || 'Неизвестная ошибка'}`, "error");
        }
    })
    .catch(error => {
        // Обрабатываем ошибки сети или ошибки при парсинге JSON
        console.error('Ошибка при отправке данных:', error);
        showStatus(`Ошибка сети или ответа: ${error.message}`, "error");
    })
    .finally(() => {
        // В любом случае (успех или ошибка) снова включаем кнопку
        submitButton.disabled = false;
        // Скрываем сообщение через некоторое время
        setTimeout(hideStatus, 5000); // Скрыть через 5 секунд
    });
});

// Вспомогательная функция для показа сообщений
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = type; // Устанавливаем класс для стилизации (success, error)
    statusMessage.style.display = 'block'; // Показываем блок
}

// Вспомогательная функция для скрытия сообщений
function hideStatus() {
    statusMessage.style.display = 'none';
    statusMessage.textContent = '';
    statusMessage.className = '';
}
