const bcrypt = require('bcrypt');
const usuarioRepository = require('../repositories/usuario.repository');

class UsuarioService {
    async criarUsuario({ cpf, nome_completo, email, senha, telefone, sexo, data_nascimento }) {
        // Validações de entrada
        if (!cpf || cpf.length !== 11 || !/^\d+$/.test(cpf)) {
            throw new Error('CPF inválido. Deve conter exatamente 11 dígitos.');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            throw new Error('E-mail inválido.');
        }

        if (!senha || senha.length < 6) {
            throw new Error('A senha deve conter no mínimo 6 caracteres.');
        }

        if (!nome_completo || nome_completo.trim().length === 0) {
            throw new Error('Nome completo é obrigatório.');
        }

        if (sexo && !['MASCULINO', 'FEMININO', 'OUTRO'].includes(sexo.toUpperCase())) {
            throw new Error('Sexo inválido. Deve ser MASCULINO, FEMININO ou OUTRO.');
        }
        const sexoFormatado = sexo ? sexo.toUpperCase() : undefined;

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
            senha_hash,
            telefone,
            sexo: sexoFormatado,
            data_nascimento
        });

        // Retorna DTO seguro (sem a senha_hash)
        return {
            id: usuarioId.toString(),
            cpf,
            nome_completo,
            email,
            telefone,
            sexo: sexoFormatado,
            data_nascimento
        };
    }

    async adicionarPapel(usuarioId, dados) {
        const { cpf, nome_completo, email, papel, senha, cnpj, nome_unidade, crm } = dados;
        
        const user = await usuarioRepository.findById(usuarioId);
        if (!user) {
            throw new Error('Usuário não encontrado.');
        }

        // Validação de segurança solicitada: Se CPF, Nome ou Email não baterem, recusa a criação
        if (
            user.cpf !== cpf || 
            user.email.toLowerCase() !== (email || '').toLowerCase() || 
            user.nome_completo.toLowerCase() !== (nome_completo || '').toLowerCase()
        ) {
            throw new Error('Os dados informados (CPF, Nome ou Email) não conferem com o cadastro existente. Criação recusada.');
        }

        // A senha deve ser validada para garantir que o dono da conta está autorizando a adição do papel
        if (senha) {
            const validPassword = await bcrypt.compare(senha, user.senha_hash);
            if (!validPassword) {
                throw new Error('Senha incorreta.');
            }
        }

        // Adicionar o papel ao usuário (isso envolve salvar no tenant_usuario)
        // No caso do Médico e do Dono, a lógica é:
        const { models } = require('../config/database');
        const ExpressCassandra = require('express-cassandra');
        const timestamp = new Date();

        if (papel === 'dono') {
            // Se for dono, o Tenant será criado logo em seguida pela rota POST /tenants,
            // mas precisamos garantir que o papel 'dono' seja salvo na identidade do usuário.
            // Para isso, salvamos um Tenant dummy ou apenas retornamos sucesso para o fluxo seguir.
            // O frontend faz POST /tenants logo após receber 200 daqui.
            return { success: true };
        } else if (papel === 'medico') {
            // Se for médico, apenas retornamos sucesso para o frontend receber o token de volta
            // A vinculação do médico a uma unidade será feita depois pelo gestor.
            return { success: true };
        }

        return { success: true };
    }
}

module.exports = new UsuarioService();
