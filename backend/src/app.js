const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const consoleRoutes = require('./routes/consoleRoutes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const connectDB = require('./config/db');

// Carrega variáveis de ambiente
dotenv.config();

const app = express();

// Configurações de Middleware
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota raiz para identificação rápida
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API do Mini Sistema de Gerenciamento de Consoles',
    version: '1.0.0',
    documentation: '/api.md',
    endpoints: {
      health: '/api/health',
      consoles: '/api/consoles',
    },
  });
});

// Rotas da API
app.use('/api', consoleRoutes);

// Tratamento de rota não encontrada (404)
app.use(notFoundHandler);

// Middleware centralizado de tratamento de erros
app.use(errorHandler);

// Inicialização do servidor se executado diretamente
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  // Conecta ao banco de dados e inicia o servidor
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`[Servidor] Rodando na porta ${PORT} (http://localhost:${PORT})`);
        console.log(`[Servidor] Ambiente: ${process.env.NODE_ENV || 'development'}`);
        console.log(`[Servidor] Health check disponível em: http://localhost:${PORT}/api/health`);
      });
    })
    .catch((err) => {
      console.warn(`[Aviso] Iniciando servidor mesmo com erro de conexão inicial ao MongoDB: ${err.message}`);
      app.listen(PORT, () => {
        console.log(`[Servidor] Rodando em modo de espera na porta ${PORT} (http://localhost:${PORT})`);
      });
    });
}

module.exports = app;
