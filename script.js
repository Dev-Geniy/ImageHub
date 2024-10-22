const apiKey = '776322487f852a2b3752cd6e0a88e7ad';
const imageInput = document.getElementById('imageInput');
const infoButton = document.getElementById('infoButton');
const infoModal = document.getElementById('infoModal');
const closeModal = document.getElementById('closeModal');
const loadingAnimation = document.getElementById('loadingAnimation');

const scriptUrl = 'https://script.google.com/macros/s/AKfycbyBOtLg1HnGNBtsA27ObRThmX1uKQFIJEjiQNURutTgnFdKJ3P2QsHB7ehW91u_6Cw/exec';

function updateBackgroundAndLinks() {
    fetch(scriptUrl + '?method=getImageLinks')
        .then(response => response.json())
        .then(data => {
            const gallery = document.getElementById('gallery');
            gallery.innerHTML = ''; // Очистка галереи перед добавлением новых изображений

            data.forEach(imageUrl => {
                const imgElement = document.createElement('img');
                imgElement.src = imageUrl;
                imgElement.alt = 'Загруженное изображение';
                imgElement.style.width = '100px';
                imgElement.style.height = 'auto';
                imgElement.style.margin = '5px';

                gallery.appendChild(imgElement); // Добавление изображения в галерею
            });

            if (data.length > 0) {
                const latestImageUrl = data[data.length - 1];
                document.body.style.backgroundImage = `url(${latestImageUrl})`;
            }
        })
        .catch((error) => {
            console.error("Ошибка получения изображений: ", error);
        });
}

imageInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('image', file);

        // Показать анимацию загрузки
        loadingAnimation.style.display = 'flex';

        fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const imageUrl = data.data.display_url;
                // Сохранение ссылки в Google Sheets
                fetch(scriptUrl, {
                    method: 'POST',
                    body: JSON.stringify({url: imageUrl}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(() => {
                    console.log("Ссылка успешно сохранена в Google Sheets!");
                    loadingAnimation.classList.add('complete'); // Установить класс для галочки
                    setTimeout(() => {
                        loadingAnimation.style.display = 'none'; // Скрыть анимацию загрузки
                        loadingAnimation.classList.remove('complete'); // Удалить класс для галочки
                    }, 1500); // Время отображения галочки
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
    }

    // Анимация кнопки загрузки
    const uploadButton = document.getElementById('uploadButton');
    uploadButton.style.animation = 'buttonAnimation 0.5s forwards';
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
