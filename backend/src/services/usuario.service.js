const bcrypt = require('bcrypt');
const usuarioRepository = require('../repositories/usuario.repository');

class UsuarioService {
    async criarUsuario({ cpf, nome_completo, email, senha }) {
        // Validações de entrada
        if (!cpf || cpf.length !== 11 || !/^\d+$/.test(cpf)) {
            throw new Error('CPF inválido. Deve conter exatamente 11 dígitos.');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            throw new Error('E-mail inválido.');
        }

        if (!senha || senha.length < 8) {
            throw new Error('A senha deve conter no mínimo 8 caracteres.');
        }

        if (!nome_completo || nome_completo.trim().length === 0) {
            throw new Error('Nome completo é obrigatório.');
        }

        // Regras de negócio (Checagem de duplicidade via Lookup Tables)
        const userByCpf = await usuarioRepository.findByCpf(cpf);
        if (userByCpf) {
            throw new Error('CPF já cadastrado.');
        }

        const userByEmail = await usuarioRepository.findByEmail(email);
        if (userByEmail) {
            throw new Error('E-mail já cadastrado.');
        }

        // Criptografia de senha
        const senha_hash = await bcrypt.hash(senha, 10);

        // Repassa ao Repository
        const usuarioId = await usuarioRepository.create({
            cpf,
            nome_completo,
            email,
            senha_hash
        });

        // Retorna DTO seguro (sem a senha_hash)
        return {
            id: usuarioId.toString(),
            cpf,
            nome_completo,
            email
        };
    }
}

module.exports = new UsuarioService();
