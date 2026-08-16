const diagnosticoService = require('../services/diagnostico.service');

const criarDiagnostico = async (req, res) => {
    try {
        const tenant_id = req.tenant.id; 
        const medico_id = req.user.id;   

        const result = await diagnosticoService.emitirDiagnostico(req.body, tenant_id, medico_id);
        
        return res.status(201).json({ message: 'Diagnóstico emitido com sucesso', data: result });
    } catch (error) {
        if (
            error.message.includes('obrigatório') || 
            error.message.includes('não pertence') ||
            error.message.includes('não encontrado') ||
            error.message.includes('inativo') ||
            error.message.includes('não possui papel')
        ) {
            return res.status(400).json({ error: error.message });
        }
        
        console.error('Erro no Controller de Diagnosticos:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const listarDiagnosticos = async (req, res) => {
    try {
        const tenant_id = req.tenant.id;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const pageState = req.query.pageState;

        const result = await diagnosticoService.listarPorTenant(tenant_id, pageState, limit);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Erro no Controller de Diagnosticos (Listar):', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const listarHistoricoPaciente = async (req, res) => {
    try {
        const tenant_id = req.tenant.id;
        const paciente_id = req.params.pacienteId;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const pageState = req.query.pageState;

        // Autorização: Se for apenas PACIENTE, só pode ver seu próprio histórico
        if (req.tenant.papeis.includes('PACIENTE') && !req.tenant.papeis.includes('MEDICO') && !req.tenant.papeis.includes('DONO')) {
            if (req.user.id !== paciente_id) {
                return res.status(403).json({ error: 'Acesso negado: Você só pode consultar o seu próprio histórico.' });
            }
        }

        const result = await diagnosticoService.listarPorPaciente(tenant_id, paciente_id, pageState, limit);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Erro no Controller de Diagnosticos (Histórico):', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const cancelarDiagnostico = async (req, res) => {
    try {
        const tenant_id = req.tenant.id;
        const medico_id = req.user.id;
        const diagnostico_id = req.params.id;

        await diagnosticoService.cancelarDiagnostico(diagnostico_id, tenant_id, medico_id);
        
        return res.status(200).json({ message: 'Diagnóstico cancelado com sucesso.' });
    } catch (error) {
        if (
            error.message.includes('não encontrado') || 
            error.message.includes('já está cancelado') ||
            error.message.includes('inválido ou inativo')
        ) {
            return res.status(400).json({ error: error.message });
        }
        
        console.error('Erro no Controller de Diagnosticos (Cancelar):', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

module.exports = {
    criarDiagnostico,
    listarDiagnosticos,
    listarHistoricoPaciente,
    cancelarDiagnostico
};
