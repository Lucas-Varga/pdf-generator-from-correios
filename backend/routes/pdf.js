const express = require('express');
const { generatePdfController } = require('../controllers/pdfController');

const router = express.Router();

router.post('/', generatePdfController);

module.exports = router;
