const tenantRepository = require('../repositories/tenant.repository');
const integrationsService = require('./integrations.service');

class TenantService {
    async criarTenant({ tipo_tenant, cpf, cnpj, razao_social, nome_fantasia, cep }, usuarioId) {
        
        if (tipo_tenant === 'CLINICA') {
            if (!cnpj || cnpj.length !== 14 || !/^\d+$/.test(cnpj)) {
                throw new Error('CNPJ inválido. Para CLINICA, deve conter exatamente 14 dígitos.');
            }
            
            // Valida CNPJ na Receita Federal (Futura integração)
            /*
            try {
                await integrationsService.fetchCnpj(cnpj);
            } catch (err) {
                throw new Error('CNPJ não encontrado ou inválido na Receita Federal.');
            }
            */
            
            // Validação de duplicidade
            const tenantByCnpj = await tenantRepository.findByCnpj(cnpj);
            if (tenantByCnpj) {
                throw new Error('CNPJ já cadastrado para outra instituição.');
            }
        } else if (tipo_tenant === 'AUTONOMO') {
            if (!cpf || cpf.length !== 11 || !/^\d+$/.test(cpf)) {
                throw new Error('CPF inválido. Para AUTONOMO, deve conter exatamente 11 dígitos.');
            }
            
            // Validação de duplicidade
            const tenantByCpf = await tenantRepository.findByCpf(cpf);
            if (tenantByCpf) {
                throw new Error('CPF já cadastrado para outro profissional.');
            }
        } else {
            throw new Error('O tipo_tenant deve ser CLINICA ou AUTONOMO.');
        }

        // Se houver CEP no cadastro, validamos via ViaCEP (Desativado a pedido do usuário)
        /*
        if (cep) {
            try {
                await integrationsService.fetchCep(cep);
            } catch (err) {
                throw new Error('O CEP fornecido é inválido ou não foi encontrado.');
            }
        }
        */

        if (!razao_social || !nome_fantasia) {
            throw new Error('Razão social e nome fantasia são obrigatórios.');
        }

        // O usuário que cria a instituição ganha papéis de administrador e paciente padrão
        const papeis = ['DONO', 'PACIENTE'];

        const tenantId = await tenantRepository.create({
            tipo_tenant,
            cpf,
            cnpj,
            razao_social,
            nome_fantasia,
            dono_id: usuarioId,
            papeis
        });

        return {
            id: tenantId.toString(),
            tipo_tenant,
            cpf,
            cnpj,
            razao_social,
            nome_fantasia,
            papeis
        };
    }
}

module.exports = new TenantService();
