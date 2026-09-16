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
        if (!exists) {
            return res.status(200).json({ exists: false });
        }
        
        // Buscar papéis do tenant_usuario
        const { models } = require('../config/database');
        const ExpressCassandra = require('express-cassandra');
        const roles = await models.instance.TenantUsuarioPorUsuario.findAsync({
            usuario_id: ExpressCassandra.uuid(exists.usuario_id),
            ativo: true
        });
        
        let papeis = [];
        roles.forEach(r => {
            papeis = [...papeis, ...(r.papeis || [])];
        });
        
        // Se ainda não tem tenant_usuario mas é paciente, forçamos 'paciente' (ou se a matriz retornar vazia)
        if (papeis.length === 0) papeis = ['paciente'];
        
        papeis = [...new Set(papeis)];

        return res.status(200).json({ 
            exists: true, 
            usuarioId: exists.usuario_id.toString(),
            papeis: papeis,
            nome_completo: exists.nome_completo,
            email: exists.email
        });
    } catch (error) {
        console.error('Erro ao verificar CPF:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

module.exports = {
    login,
    checkCpf
};
