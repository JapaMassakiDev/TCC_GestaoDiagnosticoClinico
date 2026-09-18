const requireTenantRoles = require('./authTenantRbac');
const tenantService = require('../services/tenant.service');

const validarTenantClinica = requireTenantRoles('MEDICO');

module.exports = async function resolveDiagnosticoTenant(req, res, next) {
    const tipoInformado = req.body?.tipo_tenant;
    const tipoTenant = String(tipoInformado || (req.headers['x-tenant-id'] ? 'CLINICA' : '')).toUpperCase();

    if (tipoTenant === 'AUTONOMO') {
        try {
            const tenant = await tenantService.obterOuCriarTenantAutonomo(req.user.id);
            req.tenant = {
                id: tenant.id,
                nome: tenant.nome,
                tipo_tenant: 'AUTONOMO',
                papeis: ['DONO', 'PACIENTE', 'MEDICO']
            };
            return next();
        } catch (error) {
            if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
            console.error('Erro ao resolver tenant autônomo:', error);
            return res.status(500).json({ error: 'Erro interno na autorização do atendimento autônomo.' });
        }
    }

    if (tipoTenant && tipoTenant !== 'CLINICA') {
        return res.status(400).json({ error: 'O tipo_tenant deve ser CLINICA ou AUTONOMO.' });
    }

    return validarTenantClinica(req, res, () => {
        req.tenant.tipo_tenant = 'CLINICA';
        next();
    });
};
