// src/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { gerarRecomendacoes } = require('../controllers/aiController');

router.post('/recomendacoes', gerarRecomendacoes);

module.exports = router;