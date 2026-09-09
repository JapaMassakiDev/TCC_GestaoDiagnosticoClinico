const usuarioService = require('../services/usuario.service');
const tenantService = require('../services/tenant.service');
const usuarioRepository = require('../repositories/usuario.repository');

async function runSeed() {
    console.log('Verificando a cria\u00e7\u00e3o de usu\u00e1rios padr\u00e3o...');

    try {
        // 1. Criar Paciente Padr\u00e3o
        const cpfPaciente = '12345678901';
        let pacienteExists = await usuarioRepository.findByCpf(cpfPaciente);
        if (!pacienteExists) {
            await usuarioService.criarUsuario({
                cpf: cpfPaciente,
                nome_completo: 'Ana Martins (Paciente)',
                email: 'paciente@tcc.com',
                senha: '123456'
            });
            console.log('-> Paciente padr\u00e3o criado: 12345678901 / 123456');
        }

        // 2. Criar Dono Padr\u00e3o (e seu Tenant)
        const cpfDono = '11122233344';
        let donoExists = await usuarioRepository.findByCpf(cpfDono);
        if (!donoExists) {
            const dono = await usuarioService.criarUsuario({
                cpf: cpfDono,
                nome_completo: 'Marcos Silva (Dono)',
                email: 'dono@tcc.com',
                senha: '123456'
            });

            const ExpressCassandra = require('express-cassandra');
            const fixedTenantId = ExpressCassandra.uuid('11111111-2222-3333-4444-555555555555');

            // Criar Tenant vinculado ao Dono manualmente ou passar o ID
            const schemas = require('../models');
            const timestamp = new Date();
            
            const queries = [
                new schemas.Tenant({
                    id: fixedTenantId,
                    cnpj: '12345678901234',
                    razao_social: 'Cl\u00ednica TCC M\u00e9dica',
                    nome_fantasia: 'Cl\u00ednica Sa\u00fade APP',
                    dono_id: dono.id,
                    ativo: true,
                    created_at: timestamp,
                    updated_at: timestamp
                }).save({ return_query: true }),
                new schemas.TenantPorCnpj({
                    cnpj: '12345678901234',
                    tenant_id: fixedTenantId,
                    razao_social: 'Cl\u00ednica TCC M\u00e9dica',
                    nome_fantasia: 'Cl\u00ednica Sa\u00fade APP',
                    ativo: true
                }).save({ return_query: true }),
                new schemas.TenantUsuarioPorTenant({
                    tenant_id: fixedTenantId,
                    usuario_id: dono.id,
                    papeis: ['DONO', 'MEDICO'],
                    ativo: true,
                    created_at: timestamp,
                    updated_at: timestamp
                }).save({ return_query: true }),
                new schemas.TenantUsuarioPorUsuario({
                    usuario_id: dono.id,
                    tenant_id: fixedTenantId,
                    tenant_nome: 'Cl\u00ednica Sa\u00fade APP',
                    papeis: ['DONO', 'MEDICO'],
                    ativo: true
                }).save({ return_query: true })
            ];
            
            await new Promise((resolve, reject) => {
                require('../config/database').models.doBatch(queries, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            console.log('-> Dono padr\u00e3o criado (e cl\u00ednica vinculada): 11122233344 / 123456');
        }

        // 3. Criar M\u00e9dico Padr\u00e3o
        const cpfMedico = '98765432100';
        let medicoExists = await usuarioRepository.findByCpf(cpfMedico);
        if (!medicoExists) {
            const medico = await usuarioService.criarUsuario({
                cpf: cpfMedico,
                nome_completo: 'Dr. Rafael Lima (M\u00e9dico)',
                email: 'medico@tcc.com',
                senha: '123456'
            });
            
            const ExpressCassandra = require('express-cassandra');
            const fixedTenantId = ExpressCassandra.uuid('11111111-2222-3333-4444-555555555555');
            const schemas = require('../models');
            const timestamp = new Date();
            
            const queriesMedico = [
                new schemas.TenantUsuarioPorTenant({
                    tenant_id: fixedTenantId,
                    usuario_id: medico.id,
                    papeis: ['MEDICO'],
                    ativo: true,
                    created_at: timestamp,
                    updated_at: timestamp
                }).save({ return_query: true }),
                new schemas.TenantUsuarioPorUsuario({
                    usuario_id: medico.id,
                    tenant_id: fixedTenantId,
                    tenant_nome: 'Cl\u00ednica Sa\u00fade APP',
                    papeis: ['MEDICO'],
                    ativo: true
                }).save({ return_query: true })
            ];
            
            await new Promise((resolve, reject) => {
                require('../config/database').models.doBatch(queriesMedico, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
            
            console.log('-> M\u00e9dico padr\u00e3o criado (e vinculado): 98765432100 / 123456');
        }

        console.log('Seed finalizado com sucesso!');
    } catch (err) {
        console.error('Erro ao popular dados iniciais:', err.message);
    }
}

module.exports = runSeed;
