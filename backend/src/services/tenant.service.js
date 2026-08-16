const tenantRepository = require('../repositories/tenant.repository');

class TenantService {
    async criarTenant({ cnpj, razao_social, nome_fantasia }, usuarioId) {
        if (!cnpj || cnpj.length !== 14 || !/^\d+$/.test(cnpj)) {
            throw new Error('CNPJ inválido. Deve conter exatamente 14 dígitos.');
        }

        if (!razao_social || !nome_fantasia) {
            throw new Error('Razão social e nome fantasia são obrigatórios.');
        }

        // Validação de duplicidade
        const tenantByCnpj = await tenantRepository.findByCnpj(cnpj);
        if (tenantByCnpj) {
            throw new Error('CNPJ já cadastrado para outra instituição.');
        }

        // O usuário que cria a instituição ganha papéis de administrador e paciente padrão
        const papeis = ['DONO', 'PACIENTE'];

        const tenantId = await tenantRepository.create({
            cnpj,
            razao_social,
            nome_fantasia,
            dono_id: usuarioId,
            papeis
        });

        return {
            id: tenantId.toString(),
            cnpj,
            razao_social,
            nome_fantasia,
            papeis
        };
    }
}

module.exports = new TenantService();
