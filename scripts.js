let selectedRoute = null; // Это должен быть объект с информацией о маршруте
let selectedGuide = null; // Это должен быть объект с информацией о гиде

document.addEventListener('DOMContentLoaded', function () {
    const routeNameInput = document.getElementById('route-name');
    const landmarkSelect = document.getElementById('landmark');
    const routesList = document.getElementById('routes-list');
    const pagination = document.getElementById('pagination');

    // Инициализируем массив для хранения данных о маршрутах
    let routesData = [];

    const itemsPerPage = 2;
    let currentPage = 1;
    

    // Функция для отображения маршрутов на текущей странице
   // Функция для отображения маршрутов на текущей странице
function displayRoutesOnPage(pageNumber) {
    const routesList = document.getElementById('routes-list');
    routesList.innerHTML = '';

    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const routesOnPage = routesData.slice(startIndex, endIndex);

    if (selectedRoute) {
        routesOnPage.length = 0; // Очищаем массив, чтобы отобразить только выбранный маршрут
        routesOnPage.push(selectedRoute);
    }

    if (routesOnPage.length > 0) {
        for (const route of routesOnPage) {
            const col = document.createElement('div');
            col.classList.add('col-md-6');
            col.innerHTML = `
                <div class="card mb-4">
                    <div class="card-body">
                        <h4 class="card-title">${route.name}</h4>
                        <p class="card-text">Описание: ${route.description}</p>
                        <p class="card-text">Дата создания: ${route.created_at}</p>
                        <p class="card-text">Главный объект: ${route.mainObject}</p>
                        <!-- Другие поля, которые вы хотите отобразить -->
                    </div>
                </div>
            `;
            routesList.appendChild(col);
        }
    } else {
        routesList.innerHTML = '<p>Нет маршрутов для отображения.</p>';
    }
}

    // Функция для отображения списка страниц
function displayPagination() {
    const totalPages = Math.ceil(routesData.length / itemsPerPage);
    pagination.innerHTML = '';

    const maxButtons = 3; // Максимальное количество кнопок на каждой стороне текущей страницы
    const halfMaxButtons = Math.floor(maxButtons / 2);

    let startPage = currentPage - halfMaxButtons;
    let endPage = currentPage + halfMaxButtons;

    if (startPage < 1) {
        endPage += 1 - startPage;
        startPage = 1;
    }

    if (endPage > totalPages) {
        endPage = totalPages;
        if (endPage - maxButtons + 1 > 0) {
            startPage = endPage - maxButtons + 1;
        } else {
            startPage = 1;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.classList.add('page-item');
        if (i === currentPage) {
            pageItem.classList.add('active');
        }

        const pageLink = document.createElement('a');
        pageLink.classList.add('page-link');
        pageLink.href = '#';
        pageLink.textContent = i;

        pageLink.addEventListener('click', () => {
            currentPage = i;
            displayRoutesOnPage(currentPage);
            displayPagination();
        });

        pageItem.appendChild(pageLink);
        pagination.appendChild(pageItem);
    }
}


    // Функция для заполнения выпадающего списка маршрутов
    function fillLandmarkSelect() {
        const landmarkSelect = document.getElementById('landmark');
    
        for (const route of routesData) {
            const option = document.createElement('option');
            option.value = route.id; // Используем id маршрута в качестве значения
            option.textContent = route.name; // Используем имя маршрута в тексте опции
            landmarkSelect.appendChild(option);
        }
    }

    // Загружаем данные о маршрутах с сервера
    fetch("data.json")
        .then(response => response.json())
        .then(data => {
            routesData = data; // Записываем данные в массив routesData
            fillLandmarkSelect(); // Заполняем выпадающий список маршрутов
            displayRoutesOnPage(currentPage); // Отображаем маршруты на текущей странице
            displayPagination(); // Отображаем пагинацию
        })
        .catch(error => {
            console.error('Произошла ошибка при загрузке JSON файла:', error);
        });

    // Другие функции и обработчики событий остаются без изменений

   routeNameInput.addEventListener('input', function () {
		const searchValue = routeNameInput.value.toLowerCase();
		const searchRouteId = landmarkSelect.value;

		// Ищем маршрут по имени или номеру
		selectedRoute = routesData.find(route =>
			route.name.toLowerCase() === searchValue || route.route_id === parseInt(searchRouteId, 10)
		);

		// Сбрасываем выбор страницы и отображаем только выбранный маршрут
		currentPage = 1;
		displayRoutesOnPage(currentPage);
		displayPagination();
        
        console.log(selectedRoute.id);
		// Загружаем информацию о гидах для выбранного маршрута
		loadGuides(selectedRoute.id); // Здесь вызываем loadGuides сразу после установки selectedRoute
	});


    // Заполняем выпадающий список маршрутов при загрузке страницы
    fillLandmarkSelect();

    // Обработчик события отправки формы
    document.querySelector('#search-form').addEventListener('submit', function (e) {
        e.preventDefault(); // Предотвращаем отправку формы

        const searchValue = routeNameInput.value.toLowerCase();
        const searchRouteId = landmarkSelect.value;

        // Ищем маршрут по имени или номеру
        selectedRoute = routesData.find(route => 
            route.name.toLowerCase() === searchValue || route.route_id === parseInt(searchRouteId, 10)
        );
        
        // Сбрасываем выбор страницы и отображаем только выбранный маршрут
        currentPage = 1;
        displayRoutesOnPage(currentPage);
        displayPagination();
    });

    // Запускаем отображение маршрутов на текущей странице и пагинацию при загрузке страницы
    displayRoutesOnPage(currentPage);
    displayPagination();
		

    function loadGuides(routeId) {
        // Находим выбранный маршрут по id
        selectedRoute = routesData.find(route => route.id === parseInt(routeId, 10));
        

        // Если маршрут не найден, устанавливаем selectedGuide в null и выходим
        if (!selectedRoute) {
            console.log('none');
            selectedGuide = null;
            return null;
        }
    
        // Обновляем название выбранного маршрута
        const selectedRouteNameElement = document.getElementById('selected-route-name');
        selectedRouteNameElement.textContent = `Название выбранного маршрута: ${selectedRoute.name}`;
    
        // Очищаем карточки перед обновлением информации о гидах
        for (let i = 1; i <= 2; i++) {
            const cardTitle = document.getElementById(`card-title-${i}`);
            const cardText = document.getElementById(`card-text-${i}`);
            if (cardTitle && cardText) {
                cardTitle.textContent = '';
                cardText.textContent = '';
            }
        }
    
        // Обновляем информацию о гидах
        selectedRoute.guides.forEach((guide, index) => {
            const cardTitle = document.getElementById(`card-title-${index + 1}`);
            const cardText = document.getElementById(`card-text-${index + 1}`);
            if (cardTitle && cardText) {
                cardTitle.textContent = `Гид ${index + 1}: ${guide.name}`;
                cardText.textContent = `Дополнительная информация о гиде ${index + 1}: Опыт работы - ${guide.workExperience || 0} лет`;
            }
        });
    
        // Устанавливаем selectedGuide как первого гида в списке
        selectedGuide = selectedRoute.guides[0];
    
        return selectedGuide;
    }
    

			

			//// Функция обновления информации о маршруте и гиде в модальном окне
function updateBookingForm(selectedGuide) {
    // Находим элементы ввода в модальном окне
    const routeNameInput = document.getElementById('modal-route-name');
    const guideNameInput = document.getElementById('modal-guide-name');
    
	console.log(selectedGuide);
    // Устанавливаем значения этих элементов ввода на основе выбранных данных
    routeNameInput.value = selectedRoute ? selectedRoute.name : 'Маршрут не выбран';
    guideNameInput.value = selectedGuide ? selectedGuide.name : 'Гид не выбран';
}

// Обработчик события нажатия на кнопку "Оформить заявку"
		document.getElementById('btn-primary-order').addEventListener('click', function() {
			const selectedRouteId = landmarkSelect.value;
            
			const selectedGuide = loadGuides(selectedRouteId);
			updateBookingForm(selectedGuide);
			calculateTourCost(selectedRoute, selectedGuide);
		});

        landmarkSelect.addEventListener('change', function () {
            const selectedRouteId = landmarkSelect.value;
        
            // Ищем маршрут по выбранному ID
            selectedRoute = routesData.find(route => route.id === parseInt(selectedRouteId, 10));
        
            // Сбрасываем выбор страницы и отображаем только выбранный маршрут
            currentPage = 1;
            displayRoutesOnPage(currentPage);
            displayPagination();
        
            // Загружаем информацию о гидах для выбранного маршрута
            loadGuides(selectedRoute.id);
            
            // Устанавливаем значение текстового поля в соответствии с выбранным маршрутом
            routeNameInput.value = selectedRoute ? selectedRoute.name : '';
        });
		});
		function calculateTourCost(selectedRoute, selectedGuide) {
            // Проверяем, выбраны ли маршрут и гид
            if (!selectedRoute || !selectedGuide) {
                console.log("Выберите маршрут и гида для расчета стоимости экскурсии.");
                return;
            }
        
            const pricePerHour = selectedGuide.pricePerHour;
            const guideExperience = selectedGuide.workExperience || 0; // Если опыт не указан, то 0 лет
        
            // Получаем значения из полей "Количество человек в группе" и "Дополнительные опции"
            const groupSize = parseInt(document.getElementById('group-size').value, 10) || 0;
            const option1Checkbox = document.getElementById('option1');
            const option2Checkbox = document.getElementById('option2');
            const option1Cost = option1Checkbox.checked ? 1000 : 0;
            const option2Cost = option2Checkbox.checked ? 1.3 : 1;
        
            // Получаем выбранную длительность экскурсии
            const durationSelect = document.getElementById('tour-duration');
            const selectedDuration = parseInt(durationSelect.value, 10);
        
            // Вычисляем стоимость экскурсии
            const cost = (pricePerHour * guideExperience * selectedDuration + option1Cost) * option2Cost * groupSize;
        
            console.log(cost);
            document.getElementById('total-cost').value = `${cost} рублей`;
            // Обновляем значение поля "Итоговая стоимость"
            document.getElementById('total-cost').value = `${cost} рублей`;
        }
        
        

// Обработчик события изменения поля "Количество человек в группе"
document.getElementById('group-size').addEventListener('input', function() {
    calculateTourCost(selectedRoute, selectedGuide);
});

// Обработчики событий изменения полей "Дополнительные опции"
document.getElementById('option1').addEventListener('change', function() {
    calculateTourCost(selectedRoute, selectedGuide);
});

document.getElementById('option2').addEventListener('change', function() {
    calculateTourCost(selectedRoute, selectedGuide);
});

// Обработчик события изменения поля "Длительность экскурсии"
document.getElementById('tour-duration').addEventListener('change', function() {
    calculateTourCost(selectedRoute, selectedGuide);
});