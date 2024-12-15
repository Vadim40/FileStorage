const express = require('express');
const axios = require('axios');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');

const app = express();
const PORT = 3000;

// Middleware для работы с CORS и JSON
app.use(cors());
app.use(express.json());

// Настройка multer для обработки form-data
const upload = multer();

// Прокси-эндпоинт для получения данных по CID
app.get('/proxy/pinata/:cid', async (req, res) => {
    const cid = req.params.cid;
    const url = `https://gateway.pinata.cloud/ipfs/${cid}`;

    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
        });
        res.setHeader('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching data from Pinata:', error.message);
        res.status(error.response?.status || 500).send('Error fetching data from Pinata');
    }
});

const https = require('https');

app.post('/proxy/pinata/upload', upload.single('file'), async (req, res) => {
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

    try {
        // Создаем новый объект FormData
        const formData = new FormData();

        // Добавляем файл в formData
        formData.append('file', req.file.buffer, req.file.originalname);

        // Извлекаем заголовки из запроса
        const headers = {
            ...formData.getHeaders(),
            ...req.headers // Забираем все заголовки, включая pinata_api_key и pinata_secret_api_key
        };
        console.log('FormData before sending:', formData);
        console.log('FormData Headers:', formData.getHeaders());
        
        // Создаем агент, который будет игнорировать ошибки сертификатов
        const agent = new https.Agent({ rejectUnauthorized: false });

        // Отправляем запрос на Pinata с заголовками из клиента и агентом, который игнорирует сертификаты
        const response = await axios.post(url, formData, {
            headers,
            httpsAgent: agent
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error uploading to Pinata:', error.message);
        res.status(error.response?.status || 500).send('Error uploading to Pinata');
    }
});


// Запуск сервера
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
