const request = require('supertest');
const app = require('../src/app');
const usuarioRepository = require('../src/repositories/usuario.repository');
const ExpressCassandra = require('express-cassandra');

// Mock do repository para focar no comportamento do controller e do service
jest.mock('../src/repositories/usuario.repository');

describe('Cadastro de Usuário (Integração Parcial)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve cadastrar um usuário com sucesso e retornar 201', async () => {
        // Simulando que não existe no banco
        usuarioRepository.findByCpf.mockResolvedValue(null);
        usuarioRepository.findByEmail.mockResolvedValue(null);
        
        // Simulando criação bem-sucedida retornando um UUID válido
        const fakeUuid = ExpressCassandra.uuid();
        usuarioRepository.create.mockResolvedValue(fakeUuid);

        const response = await request(app)
            .post('/usuarios')
            .send({
                cpf: '12345678901',
                nome_completo: 'João da Silva',
                email: 'joao@teste.com',
                senha: 'password123'
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Usuário cadastrado com sucesso');
        expect(response.body.data.cpf).toBe('12345678901');
        
        // Verifica se a camada Repository foi acionada
        expect(usuarioRepository.create).toHaveBeenCalled();
    });

    it('deve falhar e retornar 400 se o CPF for inválido', async () => {
        const response = await request(app)
            .post('/usuarios')
            .send({
                cpf: '123', // Inválido (menos de 11 digitos)
                nome_completo: 'João da Silva',
                email: 'joao@teste.com',
                senha: 'password123'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/CPF inválido/);
        
        // Não deve chegar no banco
        expect(usuarioRepository.create).not.toHaveBeenCalled();
    });

    it('deve falhar e retornar 400 se a senha for muito curta', async () => {
        const response = await request(app)
            .post('/usuarios')
            .send({
                cpf: '12345678901',
                nome_completo: 'João da Silva',
                email: 'joao@teste.com',
                senha: '123' // Curta demais
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/mínimo 8 caracteres/);
    });

    it('deve falhar e retornar 400 se o e-mail já estiver cadastrado no banco', async () => {
        // Simulando que findByEmail encontrou um registro
        usuarioRepository.findByCpf.mockResolvedValue(null);
        usuarioRepository.findByEmail.mockResolvedValue({ email: 'joao@teste.com' }); 

        const response = await request(app)
            .post('/usuarios')
            .send({
                cpf: '12345678901',
                nome_completo: 'João da Silva',
                email: 'joao@teste.com',
                senha: 'password123'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('E-mail já cadastrado.');
        expect(usuarioRepository.create).not.toHaveBeenCalled();
    });

    it('deve falhar e retornar 400 se o CPF já estiver cadastrado no banco', async () => {
        usuarioRepository.findByCpf.mockResolvedValue({ cpf: '12345678901' });

        const response = await request(app)
            .post('/usuarios')
            .send({
                cpf: '12345678901',
                nome_completo: 'João da Silva',
                email: 'joao2@teste.com',
                senha: 'password123'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('CPF já cadastrado.');
        expect(usuarioRepository.create).not.toHaveBeenCalled();
    });
});
