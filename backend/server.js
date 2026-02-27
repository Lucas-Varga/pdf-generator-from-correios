require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('./db/database');
const pdfRoutes = require('./routes/pdf');

const app = express();
const PORT = process.env.PORT || 3000;
const PDFS_FOLDER = process.env.PDFS_FOLDER || './pdfs';

// Criar pasta de PDFs se não existir
if (!fs.existsSync(PDFS_FOLDER)) {
  fs.mkdirSync(PDFS_FOLDER, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// CORS simples para desenvolvimento
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Rotas
app.use('/generate-pdf', pdfRoutes);

// Rota de verificação
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor está rodando' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log('📁 PDFs sendo salvos em:', PDFS_FOLDER);
  console.log(`✓ Frontend disponível em http://localhost:${PORT}/document/index.html\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Encerrando servidor...');
  db.close((err) => {
    if (err) console.error('Erro ao fechar banco:', err.message);
    process.exit(0);
  });
});
