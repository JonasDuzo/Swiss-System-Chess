const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// Listar jogadores
router.get('/', playerController.list);

// Formulário para adicionar jogador
router.get('/add', playerController.showAddForm);

// Adicionar jogador
router.post('/add', playerController.add);

// Formulário para editar jogador
router.get('/edit/:id', playerController.showEditForm);

// Atualizar jogador
router.put('/edit/:id', playerController.update);

// Excluir jogador
router.delete('/delete/:id', playerController.delete);

module.exports = router;