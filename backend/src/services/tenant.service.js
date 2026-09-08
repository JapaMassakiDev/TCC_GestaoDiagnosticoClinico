const tenantRepository = require('../repositories/tenant.repository');
const integrationsService = require('./integrations.service');

class TenantService {
    async criarTenant({ cnpj, razao_social, nome_fantasia, cep }, usuarioId) {
        if (!cnpj || cnpj.length !== 14 || !/^\d+$/.test(cnpj)) {
            throw new Error('CNPJ inválido. Deve conter exatamente 14 dígitos.');
        }

        // Valida CNPJ na Receita Federal
        try {
            await integrationsService.fetchCnpj(cnpj);
        } catch (err) {
            throw new Error('CNPJ não encontrado ou inválido na Receita Federal.');
        }

        // Se houver CEP no cadastro, validamos via ViaCEP
        if (cep) {
            try {
                await integrationsService.fetchCep(cep);
            } catch (err) {
                throw new Error('O CEP fornecido é inválido ou não foi encontrado.');
            }
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
