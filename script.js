fetch(SCRIPT_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ test: "test" })
})
.then(response => response.json())
.then(data => {
    console.log("Ответ от скрипта:", data);
    showStatus("Данные отправлены, смотри консоль!", "success");
})
.catch(error => {
    console.error('Ошибка при отправке данных:', error);
    showStatus(`Ошибка сети или ответа: ${error.message}`, "error");
});
