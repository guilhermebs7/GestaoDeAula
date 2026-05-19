const express = require('express');
const planosController = require('../controllers/planosController');

const router = express.Router();

router.get('/', planosController.listarPlanos);
router.get('/resumo/semana', planosController.contarPlanosDaSemana);
router.get('/:id', planosController.buscarPlanoPorId);
router.post('/', planosController.criarPlano);
router.put('/:id', planosController.atualizarPlano);
router.delete('/:id', planosController.deletarPlano);

module.exports = router;