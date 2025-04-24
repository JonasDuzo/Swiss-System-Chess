const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');

// Listar torneios
router.get('/', tournamentController.list);

// Formulário para criar torneio
router.get('/create', tournamentController.showCreateForm);

// Criar torneio
router.post('/create', tournamentController.create);

// Detalhes do torneio
router.get('/details/:id', tournamentController.details);

// Adicionar jogador ao torneio
router.post('/add-player', tournamentController.addPlayer);

// Remover jogador do torneio
router.get('/remove-player/:tournamentId/:playerId', tournamentController.removePlayer);

// Gerar emparelhamentos
router.get('/generate-pairings/:id', tournamentController.generatePairings);

// Ver emparelhamentos
router.get('/pairings/:id', tournamentController.viewPairings);

// Atualizar resultado
router.post('/update-result', tournamentController.updateResult);

// Ver classificação
router.get('/standings/:id', tournamentController.viewStandings);

// Excluir torneio
router.delete('/delete/:id', tournamentController.delete);

module.exports = router;