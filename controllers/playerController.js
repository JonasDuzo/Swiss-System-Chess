const Player = require('../models/player');

const playerController = {
    // Listar todos os jogadores
    list: async (req, res) => {
        try {
            const players = await Player.getAll();
            res.render('players/list', { players });
        } catch (error) {
            req.flash('error_msg', 'Erro ao listar jogadores: ' + error.message);
            res.redirect('/');
        }
    },

    // Formulário para adicionar jogador
    showAddForm: (req, res) => {
        res.render('players/register');
    },

    // Adicionar novo jogador
    add: async (req, res) => {
        try {
            const { name, rating, email, phone } = req.body;

            // Validações básicas
            if (!name || name.trim() === '') {
                req.flash('error_msg', 'Nome é obrigatório');
                return res.redirect('/players/add');
            }

            await Player.create({ name, rating, email, phone });
            req.flash('success_msg', 'Jogador cadastrado com sucesso!');
            res.redirect('/players');
        } catch (error) {
            req.flash('error_msg', 'Erro ao cadastrar jogador: ' + error.message);
            res.redirect('/players/add');
        }
    },

    // Formulário para editar jogador
    showEditForm: async (req, res) => {
        try {
            const player = await Player.getById(req.params.id);
            if (!player) {
                req.flash('error_msg', 'Jogador não encontrado');
                return res.redirect('/players');
            }
            res.render('players/edit', { player });
        } catch (error) {
            req.flash('error_msg', 'Erro ao carregar formulário de edição: ' + error.message);
            res.redirect('/players');
        }
    },

    // Atualizar jogador
    update: async (req, res) => {
        try {
            const { name, rating, email, phone } = req.body;

            // Validações básicas
            if (!name || name.trim() === '') {
                req.flash('error_msg', 'Nome é obrigatório');
                return res.redirect(`/players/edit/${req.params.id}`);
            }

            await Player.update(req.params.id, { name, rating, email, phone });
            req.flash('success_msg', 'Jogador atualizado com sucesso!');
            res.redirect('/players');
        } catch (error) {
            req.flash('error_msg', 'Erro ao atualizar jogador: ' + error.message);
            res.redirect(`/players/edit/${req.params.id}`);
        }
    },

    // Remover jogador
    delete: async (req, res) => {
        try {
            await Player.delete(req.params.id);
            req.flash('success_msg', 'Jogador removido com sucesso!');
            res.redirect('/players');
        } catch (error) {
            req.flash('error_msg', 'Erro ao remover jogador: ' + error.message);
            res.redirect('/players');
        }
    }
};

module.exports = playerController;
