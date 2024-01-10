'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3005; // Порт, на котором будет работать сервер

app.use(bodyParser.json());

const BASE_URL = "http://exam-2023-1-api.std-900.ist.mospolytech.ru/";
const API_KEY = "8515da15-8223-4988-a2da-0e110aeea1a2";

const varToString = varObj => Object.keys(varObj)[0].toLowerCase();

const dataShield = async (data) => {
  let formBody = [];
  for (let property in data) {
    let encodedKey = encodeURIComponent(property);
    let encodedValue = encodeURIComponent(data[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  formBody = formBody.join("&");
  return formBody;
};

const getRoutes = async () => {
  try {
    let endpoint = new URL("api/routes", BASE_URL);
    endpoint.searchParams.set(varToString({ API_KEY }), API_KEY);
    let response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    let data = await response.json();
    if ("error" in data) {
      throw new Error(data.error);
    } else {
      console.log("Данные о маршрутах успешно получены");
      return data;
    }
  } catch (error) {
    console.error("Ошибка при получении данных о маршрутах:", error.message);
    throw error;
  }
};

const getGuides = async (routeId) => {
  try {
    let endpoint = new URL(`api/routes/${routeId}/guides`, BASE_URL);
    endpoint.searchParams.set(varToString({ API_KEY }), API_KEY);
    let response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    let data = await response.json();
    if ("error" in data) {
      throw new Error(data.error);
    } else {
      console.log("Данные о гидах успешно получены");
      return data;
    }
  } catch (error) {
    console.error("Ошибка при получении данных о гидах:", error.message);
    throw error;
  }
};

const saveDataToFile = async (data) => {
  try {
    const filePath = path.join(__dirname, 'data.json'); // Путь к файлу

    // Для каждого маршрута, получите данные о гидах и добавьте их к маршруту
    for (let route of data) {
      const guidesData = await getGuides(route.id); // Получить данные о гидах для маршрута
      route.guides = guidesData; // Добавить данные о гидах к маршруту
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log("Данные успешно сохранены в data.json");
  } catch (error) {
    console.error("Ошибка при сохранении данных:", error.message);
    throw error;
  }
};

// Роут для получения данных и сохранения их в файл
app.get('/get-data', async (req, res) => {
  try {
    let data = await getRoutes();
    saveDataToFile(data);
    res.json({ message: "Данные успешно получены и сохранены" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Произошла ошибка при получении и сохранении данных" });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
