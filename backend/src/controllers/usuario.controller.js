const usuarioService = require('../services/usuario.service');

const criarUsuario = async (req, res) => {
    try {
        const result = await usuarioService.criarUsuario(req.body);
        return res.status(201).json({ message: 'Usuário cadastrado com sucesso', data: result });
    } catch (error) {
        // Controle simples de status HTTP baseado na mensagem de erro do Service
        if (
            error.message.includes('inválido') || 
            error.message.includes('obrigatório') || 
            error.message.includes('já cadastrado') ||
            error.message.includes('mínimo')
        ) {
            return res.status(400).json({ error: error.message });
        }
        
        console.error('Erro no Controller de Usuários:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const buscarUsuarioPorCpf = async (req, res) => {
    try {
        const { cpf } = req.params;
        const usuarioRepository = require('../repositories/usuario.repository');
        const user = await usuarioRepository.findByCpf(cpf);
        if (!user) return res.status(404).json({ error: 'Paciente n\u00e3o encontrado' });
        return res.status(200).json({ id: user.usuario_id.toString(), name: user.nome_completo });
    } catch (error) {
        return res.status(500).json({ error: 'Erro interno' });
    }
};

module.exports = {
    criarUsuario,
    buscarUsuarioPorCpf
};
