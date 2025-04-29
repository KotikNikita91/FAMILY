const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyu_RykMdTKm_enaxIJf79KerTLJH1w_-f-xaXt3zlZepQpDm1-Sz3nbjC4IkxLxzROgA/exec';

const form = document.getElementById('expenseForm');
const submitButton = document.getElementById('submitButton');
const statusMessage = document.getElementById('statusMessage');
const expensesList = document.getElementById('expensesList'); // Предполагается элемент для отображения расходов

submitButton.addEventListener('click', function(e) {
    e.preventDefault();

    submitButton.disabled = true;
    showStatus("Отправка данных...", "info");

    const formData = new FormData(form);
    const dataToSend = {
        type: 'expense',
        amount: parseFloat(formData.get('amount')), // Преобразуем в число
        category: formData.get('category'),
        comment: formData.get('comment'),
        author: formData.get('who')
    };

    fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`HTTP ошибка! Статус: ${response.status}. Сообщение: ${text || 'Нет дополнительной информации'}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.status === "success") {
            showStatus("Успешно добавлено!", "success");
            form.reset();
            loadExpenses(); // Загружаем обновленный список расходов
        } else {
            showStatus(`Ошибка скрипта: ${data.message || 'Неизвестная ошибка'}`, "error");
        }
    })
    .catch(error => {
        console.error('Ошибка при отправке данных:', error);
        showStatus(`Ошибка сети или ответа: ${error.message}`, "error");
    })
    .finally(() => {
        submitButton.disabled = false;
        setTimeout(hideStatus, 5000);
    });
});

function loadExpenses() {
    fetch(SCRIPT_URL) // GET-запрос на тот же URL для получения данных
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`HTTP ошибка при загрузке расходов: ${response.status}. Сообщение: ${text || 'Нет дополнительной информации'}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data && data.expenses && expensesList) {
            expensesList.innerHTML = ''; // Очищаем список
            if (data.expenses.length > 0) {
                const ul = document.createElement('ul');
                data.expenses.forEach(expense => {
                    const li = document.createElement('li');
                    li.textContent = `${expense.date.substring(0, 10)} - ${expense.amount} ${expense.category} (${expense.author || 'Общий'}) - ${expense.comment || ''}`;
                    ul.appendChild(li);
                });
                expensesList.appendChild(ul);
            } else {
                expensesList.textContent = 'Расходов пока нет.';
            }
        }
    })
    .catch(error => {
        console.error('Ошибка при загрузке расходов:', error);
        if (expensesList) {
            expensesList.textContent = `Ошибка загрузки расходов: ${error.message}`;
        }
    });
}

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = type;
    statusMessage.style.display = 'block';
}

function hideStatus() {
    statusMessage.style.display = 'none';
    statusMessage.textContent = '';
    statusMessage.className = '';
}

// Загружаем расходы при загрузке страницы
document.addEventListener('DOMContentLoaded', loadExpenses);
