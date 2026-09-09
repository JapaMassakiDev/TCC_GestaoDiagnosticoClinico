const tenantService = require('../services/tenant.service');

const criarTenant = async (req, res) => {
    try {
        // O usuário logado, recuperado do JWT pelo Middleware, será o "Dono" do Tenant
        const usuarioId = req.user.id;
        
        const result = await tenantService.criarTenant(req.body, usuarioId);
        
        return res.status(201).json({ message: 'Instituição criada com sucesso', data: result });
    } catch (error) {
        if (
            error.message.includes('inválido') || 
            error.message.includes('obrigatório') || 
            error.message.includes('já cadastrado') ||
            error.message.includes('exatamente') ||
            error.message.includes('Receita Federal')
        ) {
            return res.status(400).json({ error: error.message });
        }
        
        console.error('Erro no Controller de Tenants:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const listarMeusTenants = async (req, res) => {
    try {
        const { models } = require('../config/database');
        const ExpressCassandra = require('express-cassandra');
        const tenantUsuarios = await models.instance.TenantUsuarioPorUsuario.findAsync({
            usuario_id: ExpressCassandra.uuid(req.user.id),
            ativo: true
        });
        
        const units = tenantUsuarios.map(t => ({
            id: t.tenant_id.toString(),
            name: t.tenant_nome,
            address: "",
            phone: "",
            cep: ""
        }));
        
        return res.status(200).json(units);
    } catch (error) {
        console.error('Erro ao listar tenants:', error);
        return res.status(500).json({ error: 'Erro interno' });
    }
};

module.exports = {
    criarTenant,
    listarMeusTenants
};
