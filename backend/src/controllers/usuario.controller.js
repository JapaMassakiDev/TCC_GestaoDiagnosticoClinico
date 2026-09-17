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

const adicionarPapel = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome_completo, email, cpf, papel } = req.body; // payload sends these mapped differently maybe? Let's check.
        // Wait, frontend sends name, email, cpf as part of the form, but let's check what authService sends:
        // { papel: dadosCadastro.role, nome_unidade: ... }
        // Let's implement it carefully.
        const result = await usuarioService.adicionarPapel(id, req.body);
        return res.status(200).json({ message: 'Papel adicionado', data: result });
    } catch (error) {
        if (error.message.includes('não confere') || error.message.includes('inválido') || error.message.includes('incorreta')) {
            return res.status(400).json({ error: error.message });
        }
        console.error('Erro em adicionarPapel:', error);
        return res.status(500).json({ error: 'Erro interno' });
    }
};

const atualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verifica se o id da rota é o mesmo do token (segurança)
        if (req.user && req.user.id !== id) {
            return res.status(403).json({ error: 'Você não tem permissão para alterar outro usuário.' });
        }

        const user = await usuarioService.atualizar(id, req.body);
        
        // Retornar no formato esperado pelo normalizarUsuario do frontend
        return res.status(200).json({
            usuario: {
                id: user.id.toString(),
                cpf: user.cpf,
                email: user.email,
                nome_completo: user.nome_completo,
                telefone: user.telefone,
                sexo: user.sexo,
                data_nascimento: user.data_nascimento
            }
        });
    } catch (error) {
        if (error.message.includes('não encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('mínimo')) {
            return res.status(400).json({ error: error.message });
        }
        console.error('Erro em atualizarUsuario:', error);
        return res.status(500).json({ error: 'Erro interno' });
    }
};

module.exports = {
    criarUsuario,
    buscarUsuarioPorCpf,
    adicionarPapel,
    atualizarUsuario
};
