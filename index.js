'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(bodyParser.json());

const BASE_URL = "http://exam-2023-1-api.std-900.ist.mospolytech.ru/";
const API_KEY = "8515da15-8223-4988-a2da-0e110aeea1a2";

const toSnakeCase = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const encodeFormData = (data) => {
  const formBody = Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(toSnakeCase(key))}=${encodeURIComponent(value)}`)
    .join("&");
  return formBody;
};

const fetchData = async (url, errorMessage) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const data = await response.json();
    if ("error" in data) {
      throw new Error(data.error);
    } else {
      console.log(`Data successfully fetched from ${url}`);
      return data;
    }
  } catch (error) {
    console.error(`${errorMessage}: ${error.message}`);
    throw error;
  }
};

const getRoutes = async () => {
  const url = new URL("api/routes", BASE_URL);
  url.searchParams.set(toSnakeCase("API_KEY"), API_KEY);
  return fetchData(url, "Error while fetching route data");
};

const getGuides = async (routeId) => {
  const url = new URL(`api/routes/${routeId}/guides`, BASE_URL);
  url.searchParams.set(toSnakeCase("API_KEY"), API_KEY);
  return fetchData(url, "Error while fetching guide data");
};

const saveDataToFile = async (data) => {
  try {
    const filePath = path.join(__dirname, 'data.json');

    for (const route of data) {
      const guidesData = await getGuides(route.id);
      route.guides = guidesData;
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log("Data successfully saved to data.json");
  } catch (error) {
    console.error(`Error while saving data: ${error.message}`);
    throw error;
  }
};

app.get('/get-data', async (req, res) => {
  try {
    const data = await getRoutes();
    await saveDataToFile(data);
    res.json({ message: "Data successfully fetched and saved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error while fetching and saving data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

