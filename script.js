const apiKey = '776322487f852a2b3752cd6e0a88e7ad'; // Ваш API-ключ
const imageInput = document.getElementById('imageInput');
const infoButton = document.getElementById('infoButton');
const infoModal = document.getElementById('infoModal');
const closeModal = document.getElementById('closeModal');

// Замените на URL вашего веб-приложения Google Apps Script
const scriptUrl = 'https://script.google.com/macros/s/AKfycbw2wJqd17VEt0EaSK02W5_V2TP2lmpsm8R2t8BzWQKgVcMsqnEIdQ1ZYlVxZerKwrM/exec'; 

// Добавляем прокси URL
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

// Функция для обновления фона и отображения сохранённых ссылок
function updateBackgroundAndLinks() {
    fetch(proxyUrl + scriptUrl + '?method=getImageLinks') // Используем прокси
        .then(response => response.json())
        .then(data => {
            const gallery = document.getElementById('gallery');
            gallery.innerHTML = ''; // Очистка галереи перед добавлением новых изображений

            data.forEach(imageUrl => {
                const imgElement = document.createElement('img');
                imgElement.src = imageUrl;
                imgElement.alt = 'Загруженное изображение';
                imgElement.style.width = '100px'; // Ширина изображения в галерее
                imgElement.style.height = 'auto'; // Автоматическая высота
                imgElement.style.margin = '5px'; // Отступы между изображениями

                gallery.appendChild(imgElement); // Добавление изображения в галерею
            });

            if (data.length > 0) {
                const latestImageUrl = data[data.length - 1]; // Самая последняя сохраненная ссылка
                document.body.style.backgroundImage = `url(${latestImageUrl})`;
            }
        })
        .catch((error) => {
            console.error("Ошибка получения изображений: ", error);
        });
}

// Событие изменения загрузки изображения
imageInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('image', file);

        fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const imageUrl = data.data.display_url;
                // Сохранение ссылки в Google Sheets
                fetch(proxyUrl + scriptUrl, { // Используем прокси
                    method: 'POST',
                    body: JSON.stringify({url: imageUrl}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(() => {
                    console.log("Ссылка успешно сохранена в Google Sheets!");
                    updateBackgroundAndLinks(); // Обновление фона и сохранённых ссылок
                })
                .catch((error) => {
                    console.error("Ошибка сохранения ссылки: ", error);
                });
            } else {
                console.error('Ошибка загрузки изображения:', data.error);
            }
        })
        .catch(error => console.error('Ошибка:', error));
});

// Показать всплывающее окно
infoButton.addEventListener('click', () => {
    infoModal.style.display = 'block';
});

// Закрыть всплывающее окно
closeModal.addEventListener('click', () => {
    infoModal.style.display = 'none';
});

// Обновить фон и ссылки при загрузке страницы
window.onload = updateBackgroundAndLinks;
