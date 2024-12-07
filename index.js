const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');

const app = express();
const PORT = 3000;

// Логирование всех входящих запросов
app.use((req, res, next) => {
  console.log(`[Middleware] Incoming request: ${req.method} ${req.url}`);
  next();
});

// Прокси-запросы на Pinata
app.use(
  '/pinata',
  createProxyMiddleware({
    target: 'https://api.pinata.cloud',
    changeOrigin: true,
    pathRewrite: { '^/pinata': '' },
    logLevel: 'debug', // Включаем подробное логирование прокси

    onProxyReq: (proxyReq, req, res) => {
      console.log(`[Proxy] onProxyReq: Sending request to: ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
      if (req.headers['expect']) {
        const expectHeader = req.headers['expect'];
        proxyReq.setHeader('Expect', expectHeader); // Восстанавливаем заголовок
        console.log(`[Proxy] Restored Expect header: ${expectHeader}`);
      }
    },

    onProxyRes: (proxyRes, req, res) => {
      console.log(`[Proxy] onProxyRes: Response received with status: ${proxyRes.statusCode}`);
      let body = '';
      proxyRes.on('data', (chunk) => {
        body += chunk;
      });
      proxyRes.on('end', () => {
        console.log(`[Proxy] onProxyRes: Response body: ${body}`);
      });
      console.log(`[Proxy] Response headers:`, proxyRes.headers);
    },

    onError: (err, req, res) => {
      console.error('[Proxy] onError: Proxy error:', err);
      res.status(500).send('Proxy error');
    },
  })
);

// Проверка, что прокси включен
app.use((req, res, next) => {
  console.log('[Middleware] Proxy is working.');
  next();
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
