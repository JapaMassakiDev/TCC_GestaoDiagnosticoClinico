const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');
const usuarioRepository = require('../repositories/usuario.repository');

const login = async (req, res) => {
    try {
        const result = await authService.login(req.body);
        return res.status(200).json(result);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Erro no Controller de Auth:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const checkCpf = async (req, res) => {
    try {
        const { cpf } = req.params;
        const exists = await usuarioRepository.findByCpf(cpf);
        return res.status(200).json({ exists: !!exists });
    } catch (error) {
        console.error('Erro ao verificar CPF:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

module.exports = {
    login,
    checkCpf
};
