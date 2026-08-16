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
            error.message.includes('exatamente')
        ) {
            return res.status(400).json({ error: error.message });
        }
        
        console.error('Erro no Controller de Tenants:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

module.exports = {
    criarTenant
};
