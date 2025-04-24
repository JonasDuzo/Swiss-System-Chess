const Tournament = require('../models/tournament');
const Player = require('../models/player');

const tournamentController = {
  // Listar todos os torneios
  list: async (req, res) => {
    try {
      const tournaments = await Tournament.getAll();
      res.render('tournaments/list', { tournaments });
    } catch (error) {
      req.flash('error_msg', 'Erro ao listar torneios: ' + error.message);
      res.redirect('/');
    }
  },

  // Formulário para criar torneio
  showCreateForm: (req, res) => {
    res.render('tournaments/create');
  },

  // Criar novo torneio
  create: async (req, res) => {
    try {
      const { name, location, startDate, endDate, rounds } = req.body;

      // Validações básicas
      if (!name || name.trim() === '') {
        req.flash('error_msg', 'Nome do torneio é obrigatório');
        return res.redirect('/tournaments/create');
      }

      await Tournament.create({ name, location, startDate, endDate, rounds });
      req.flash('success_msg', 'Torneio criado com sucesso!');
      res.redirect('/tournaments');
    } catch (error) {
      req.flash('error_msg', 'Erro ao criar torneio: ' + error.message);
      res.redirect('/tournaments/create');
    }
  },

  // Ver detalhes do torneio
  details: async (req, res) => {
    try {
      const tournament = await Tournament.getById(req.params.id);
      if (!tournament) {
        req.flash('error_msg', 'Torneio não encontrado');
        return res.redirect('/tournaments');
      }

      // Carregar lista de jogadores
      const registeredPlayers = [];
      for (const playerId of tournament.players || []) {
        const player = await Player.getById(playerId);
        if (player) {
          registeredPlayers.push(player);
        }
      }

      // Carregar lista completa de jogadores para adicionar ao torneio
      const allPlayers = await Player.getAll();
      const availablePlayers = allPlayers.filter(player =>
        !tournament.players || !tournament.players.includes(player.id)
      );

      res.render('tournaments/details', {
        tournament,
        registeredPlayers,
        availablePlayers
      });
    } catch (error) {
      req.flash('error_msg', 'Erro ao carregar detalhes do torneio: ' + error.message);
      res.redirect('/tournaments');
    }
  },

  // Adicionar jogador ao torneio
  addPlayer: async (req, res) => {
    try {
      const { tournamentId, playerId } = req.body;

      await Tournament.addPlayer(tournamentId, playerId);
      req.flash('success_msg', 'Jogador adicionado ao torneio com sucesso!');
      res.redirect(`/tournaments/details/${tournamentId}`);
    } catch (error) {
      req.flash('error_msg', 'Erro ao adicionar jogador ao torneio: ' + error.message);
      res.redirect(`/tournaments/details/${req.body.tournamentId}`);
    }
  },

  // Remover jogador do torneio
  removePlayer: async (req, res) => {
    try {
      const { tournamentId, playerId } = req.params;

      await Tournament.removePlayer(tournamentId, playerId);
      req.flash('success_msg', 'Jogador removido do torneio com sucesso!');
      res.redirect(`/tournaments/details/${tournamentId}`);
    } catch (error) {
      req.flash('error_msg', 'Erro ao remover jogador do torneio: ' + error.message);
      res.redirect(`/tournaments/details/${req.params.tournamentId}`);
    }
  },

  // Gerar emparelhamentos para a próxima rodada
  generatePairings: async (req, res) => {
    try {
      const tournamentId = req.params.id;

      await Tournament.generatePairings(tournamentId);
      req.flash('success_msg', 'Emparelhamentos gerados com sucesso!');
      res.redirect(`/tournaments/pairings/${tournamentId}`);
    } catch (error) {
      req.flash('error_msg', 'Erro ao gerar emparelhamentos: ' + error.message);
      res.redirect(`/tournaments/details/${req.params.id}`);
    }
  },

  // Ver emparelhamentos do torneio
  viewPairings: async (req, res) => {
    try {
      const tournamentId = req.params.id;
      const tournament = await Tournament.getById(tournamentId);

      if (!tournament) {
        req.flash('error_msg', 'Torneio não encontrado');
        return res.redirect('/tournaments');
      }

      // Organizar emparelhamentos por rodada
      const pairingsByRound = {};

      if (tournament.pairings && tournament.pairings.length > 0) {
        for (const pairing of tournament.pairings) {
          if (!pairingsByRound[pairing.round]) {
            pairingsByRound[pairing.round] = [];
          }

          // Carregar nomes dos jogadores
          let whiteName = 'Desconhecido';
          let blackName = pairing.black === 'bye' ? 'Bye (sem adversário)' : 'Desconhecido';

          const whitePlayer = await Player.getById(pairing.white);
          if (whitePlayer) {
            whiteName = whitePlayer.name;
          }

          if (pairing.black !== 'bye') {
            const blackPlayer = await Player.getById(pairing.black);
            if (blackPlayer) {
              blackName = blackPlayer.name;
            }
          }

          pairingsByRound[pairing.round].push({
            ...pairing,
            whiteName,
            blackName
          });
        }
      }

      res.render('tournaments/pairings', {
        tournament,
        pairingsByRound,
        currentRound: tournament.currentRound
      });
    } catch (error) {
      req.flash('error_msg', 'Erro ao carregar emparelhamentos: ' + error.message);
      res.redirect('/tournaments');
    }
  },

  // Atualizar resultado de uma partida
  updateResult: async (req, res) => {
    try {
      const { tournamentId, round, white, black, result } = req.body;

      await Tournament.updateResult(tournamentId, round, white, black, result);
      req.flash('success_msg', 'Resultado atualizado com sucesso!');
      res.redirect(`/tournaments/pairings/${tournamentId}`);
    } catch (error) {
      req.flash('error_msg', 'Erro ao atualizar resultado: ' + error.message);
      res.redirect(`/tournaments/pairings/${req.body.tournamentId}`);
    }
  },

  // Ver classificação do torneio
  viewStandings: async (req, res) => {
    try {
      const tournamentId = req.params.id;
      const tournament = await Tournament.getById(tournamentId);

      if (!tournament) {
        req.flash('error_msg', 'Torneio não encontrado');
        return res.redirect('/tournaments');
      }

      const standings = await Tournament.getStandings(tournamentId);

      res.render('tournaments/standings', {
        tournament,
        standings
      });
    } catch (error) {
      req.flash('error_msg', 'Erro ao carregar classificação: ' + error.message);
      res.redirect('/tournaments');
    }
  },

  // Excluir torneio
  delete: async (req, res) => {
    try {
      await Tournament.delete(req.params.id);
      req.flash('success_msg', 'Torneio excluído com sucesso!');
      res.redirect('/tournaments');
    } catch (error) {
      req.flash('error_msg', 'Erro ao excluir torneio: ' + error.message);
      res.redirect('/tournaments');
    }
  }
};

module.exports = tournamentController;