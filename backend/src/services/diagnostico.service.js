const diagnosticoRepository = require('../repositories/diagnostico.repository');
const medicoRepository = require('../repositories/medico.repository');
const tenantRepository = require('../repositories/tenant.repository');

class DiagnosticoService {
    async emitirDiagnostico({ paciente_id, titulo, descricao, codigo_cid }, tenant_id, medico_id) {
        if (!titulo || titulo.trim().length === 0) {
            throw new Error('O título do diagnóstico é obrigatório.');
        }

        if (!descricao || descricao.trim().length === 0) {
            throw new Error('A descrição do diagnóstico é obrigatória.');
        }

        if (!paciente_id) {
            throw new Error('O paciente_id é obrigatório.');
        }

        // Regra 2 e 3: Perfil profissional existe e está ativo
        const medico = await medicoRepository.findById(medico_id);
        if (!medico) {
            throw new Error('Perfil profissional do médico não encontrado no sistema.');
        }
        if (!medico.ativo) {
            throw new Error('Perfil profissional do médico está inativo.');
        }

        // Regra 4 e 5: Paciente pertence ao mesmo tenant e possui o papel PACIENTE
        const pacienteNoTenant = await tenantRepository.findUserInTenant(tenant_id, paciente_id);
        if (!pacienteNoTenant) {
            throw new Error('Paciente não pertence a esta instituição.');
        }
        if (!pacienteNoTenant.ativo) {
            throw new Error('O cadastro do paciente está inativo nesta instituição.');
        }
        if (!pacienteNoTenant.papeis.includes('PACIENTE')) {
            throw new Error('O usuário informado não possui papel de PACIENTE nesta instituição.');
        }

        // Persistência em Lote
        const diagnosticoId = await diagnosticoRepository.create({
            tenant_id,
            medico_id,
            paciente_id,
            titulo,
            descricao,
            codigo_cid
        }, 'CRIAR_DIAGNOSTICO');

        return {
            id: diagnosticoId.toString(),
            tenant_id,
            medico_id,
            paciente_id,
            titulo,
            codigo_cid,
            status: 'ATIVO'
        };
    }

    async listarPorTenant(tenant_id, pageState, limit) {
        let stateBuffer = null;
        if (pageState) {
            stateBuffer = Buffer.from(pageState, 'hex');
        }
        return await diagnosticoRepository.findByTenant(tenant_id, stateBuffer, limit);
    }

    async listarPorPaciente(tenant_id, paciente_id, pageState, limit) {
        let stateBuffer = null;
        if (pageState) {
            stateBuffer = Buffer.from(pageState, 'hex');
        }
        return await diagnosticoRepository.findByPaciente(tenant_id, paciente_id, stateBuffer, limit);
    }

    async cancelarDiagnostico(diagnostico_id, tenant_id, medico_id) {
        // Valida se o médico tem o perfil ativo
        const medico = await medicoRepository.findById(medico_id);
        if (!medico || !medico.ativo) {
            throw new Error('Perfil profissional do médico inválido ou inativo.');
        }

        const diagnostico = await diagnosticoRepository.findByIdAndTenant(tenant_id, diagnostico_id);
        if (!diagnostico) {
            throw new Error('Diagnóstico não encontrado neste tenant.');
        }

        if (diagnostico.status === 'CANCELADO') {
            throw new Error('Diagnóstico já está cancelado.');
        }

        await diagnosticoRepository.updateStatus(diagnostico, 'CANCELADO', 'CANCELAR_DIAGNOSTICO', medico_id);
        return true;
    }
}

module.exports = new DiagnosticoService();
