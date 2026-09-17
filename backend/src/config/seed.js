const usuarioService = require('../services/usuario.service');
const tenantService = require('../services/tenant.service');
const usuarioRepository = require('../repositories/usuario.repository');

async function runSeed() {
    console.log('Verificando a criação de usuários padrão...');

    try {
        const ExpressCassandra = require('express-cassandra');
        const schemas = require('../models');
        const timestamp = new Date();
        const fixedTenantId = ExpressCassandra.uuid('11111111-2222-3333-4444-555555555555');

        // 1. Criar Paciente Padrão
        const cpfPaciente = '12345678901';
        let pacienteExists = await usuarioRepository.findByCpf(cpfPaciente);
        if (!pacienteExists) {
            await usuarioService.criarUsuario({
                cpf: cpfPaciente,
                nome_completo: 'Ana Martins (Paciente)',
                email: 'paciente@tcc.com',
                senha: '123456'
            });
            console.log('-> Paciente padrão criado: 12345678901 / 123456');
        }

        // 2. Criar Dono Padrão (e seu Tenant)
        const cpfDono = '11122233344';
        let donoExists = await usuarioRepository.findByCpf(cpfDono);
        if (!donoExists) {
            const dono = await usuarioService.criarUsuario({
                cpf: cpfDono,
                nome_completo: 'Marcos Silva (Dono)',
                email: 'dono@tcc.com',
                senha: '123456'
            });

            const donoId = dono.id;
            
            const queries = [
                new schemas.Tenant({
                    id: fixedTenantId,
                    tipo_tenant: 'CLINICA',
                    cnpj: '12345678901234',
                    razao_social: 'Clínica TCC Médica',
                    nome_fantasia: 'Clínica Saúde APP',
                    dono_id: donoId,
                    ativo: true,
                    created_at: timestamp,
                    updated_at: timestamp
                }).save({ return_query: true }),
                new schemas.TenantPorCnpj({
                    cnpj: '12345678901234',
                    tenant_id: fixedTenantId,
                    razao_social: 'Clínica TCC Médica',
                    nome_fantasia: 'Clínica Saúde APP',
                    ativo: true
                }).save({ return_query: true }),
                new schemas.TenantUsuarioPorTenant({
                    tenant_id: fixedTenantId,
                    usuario_id: donoId,
                    papeis: ['DONO', 'MEDICO', 'PACIENTE'],
                    ativo: true,
                    created_at: timestamp,
                    updated_at: timestamp
                }).save({ return_query: true }),
                new schemas.TenantUsuarioPorUsuario({
                    usuario_id: donoId,
                    tenant_id: fixedTenantId,
                    tenant_nome: 'Clínica Saúde APP',
                    papeis: ['DONO', 'MEDICO', 'PACIENTE'],
                    ativo: true
                }).save({ return_query: true }),
                new schemas.Medico({
                    usuario_id: donoId,
                    crm: '123456-SP',
                    ativo: true,
                    created_at: timestamp,
                    updated_at: timestamp
                }).save({ return_query: true })
            ];
            
            await new Promise((resolve, reject) => {
                require('../config/database').models.doBatch(queries, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            console.log('-> Dono padrão criado (e clínica vinculada): 11122233344 / 123456');
        }

        // 3. Criar Médico Padrão
        const cpfMedico = '98765432100';
        let medicoExists = await usuarioRepository.findByCpf(cpfMedico);
        if (!medicoExists) {
            const medico = await usuarioService.criarUsuario({
                cpf: cpfMedico,
                nome_completo: 'Dr. Rafael Lima (Médico)',
                email: 'medico@tcc.com',
                senha: '123456'
            });
            
            const medicoId = medico.id;
            
            const queriesMedico = [
                new schemas.TenantUsuarioPorTenant({
                    tenant_id: fixedTenantId,
                    usuario_id: medicoId,
                    papeis: ['MEDICO', 'PACIENTE'],
                    ativo: true,
                    created_at: timestamp,
                    updated_at: timestamp
                }).save({ return_query: true }),
                new schemas.TenantUsuarioPorUsuario({
                    usuario_id: medicoId,
                    tenant_id: fixedTenantId,
                    tenant_nome: 'Clínica Saúde APP',
                    papeis: ['MEDICO', 'PACIENTE'],
                    ativo: true
                }).save({ return_query: true }),
                new schemas.Medico({
                    usuario_id: medicoId,
                    crm: 'CRM98765-RJ',
                    ativo: true,
                    created_at: timestamp,
                    updated_at: timestamp
                }).save({ return_query: true })
            ];
            
            await new Promise((resolve, reject) => {
                require('../config/database').models.doBatch(queriesMedico, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
            
            console.log('-> Médico padrão criado (e vinculado): 98765432100 / 123456');
        }

        console.log('Seed finalizado com sucesso!');
    } catch (err) {
        console.error('Erro ao popular dados iniciais:', err.message);
    }
}

module.exports = runSeed;
