const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// CONFIGURAÇÃO DO ALVO (VPS TRACCAR)
const TRACCAR_HOST = process.env.TRACCAR_HOST || 'https://demo.traccar.org';

app.use(morgan('dev'));

// CORS permissivo para dev
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.get('/health', (req, res) => {
    res.json({ status: 'Online', target: TRACCAR_HOST });
});

// Proxy WebSocket
const wsProxy = createProxyMiddleware({
    target: TRACCAR_HOST,
    changeOrigin: true,
    ws: true,
    secure: false, // Aceita SSL auto-assinado da VPS
    pathRewrite: { '^/api/socket': '/api/socket' },
    logLevel: 'debug'
});
app.use('/api/socket', wsProxy);

// Proxy REST API
const apiProxy = createProxyMiddleware({
    target: TRACCAR_HOST,
    changeOrigin: true,
    secure: false, // Aceita SSL auto-assinado
    pathRewrite: { '^/api': '/api' },
    onProxyRes: (proxyRes) => {
        // Ajusta Cookies para funcionar em localhost (Remove Secure e Strict)
        const cookies = proxyRes.headers['set-cookie'];
        if (cookies) {
            proxyRes.headers['set-cookie'] = cookies.map(c => 
                c.replace(/; Secure/gi, '').replace(/; SameSite=Strict/gi, '; SameSite=Lax')
            );
        }
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err.message);
        res.status(502).json({ error: 'Erro de conexão com VPS', details: err.message });
    }
});
app.use('/api', apiProxy);

const server = app.listen(PORT, () => {
    console.log(`
    🚀 PROXY RODANDO EM: http://localhost:${PORT}
    🎯 ALVO TRACCAR:     ${TRACCAR_HOST}
    
    [IMPORTANTE]
    Se você estiver usando uma VPS própria, crie um arquivo .env nesta pasta com:
    TRACCAR_HOST=http://seu-ip-da-vps:8082
    `);
});

server.on('upgrade', (req, socket, head) => wsProxy.upgrade(req, socket, head));