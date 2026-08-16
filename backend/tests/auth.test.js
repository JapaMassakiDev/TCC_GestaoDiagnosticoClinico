const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const app = require('../src/app');
const usuarioRepository = require('../src/repositories/usuario.repository');
const authenticate = require('../src/middleware/authenticate');
const jwt = require('jsonwebtoken');

jest.mock('../src/repositories/usuario.repository');

describe('Autenticação (Login & Middleware)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /auth/login', () => {
        it('deve retornar 400 se CPF ou senha não forem enviados', async () => {
            const res = await request(app).post('/auth/login').send({ cpf: '12345678901' });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/obrigatórios/);
        });

        it('deve retornar 401 se o CPF não for encontrado', async () => {
            usuarioRepository.findByCpf.mockResolvedValue(null);
            
            const res = await request(app).post('/auth/login').send({ cpf: '000', senha: '123' });
            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Credenciais inválidas.');
        });

        it('deve retornar 403 se o usuário estiver desativado', async () => {
            usuarioRepository.findByCpf.mockResolvedValue({ usuario_id: 'fake-uuid' });
            usuarioRepository.findById.mockResolvedValue({ id: 'fake-uuid', ativo: false });
            
            const res = await request(app).post('/auth/login').send({ cpf: '123', senha: '123' });
            expect(res.status).toBe(403);
            expect(res.body.error).toBe('Usuário desativado.');
        });

        it('deve retornar 401 se a senha for inválida', async () => {
            const hash = await bcrypt.hash('senhaCorreta', 10);
            usuarioRepository.findByCpf.mockResolvedValue({ usuario_id: 'fake-uuid' });
            usuarioRepository.findById.mockResolvedValue({ id: 'fake-uuid', ativo: true, senha_hash: hash });
            
            const res = await request(app).post('/auth/login').send({ cpf: '123', senha: 'senhaIncorreta' });
            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Credenciais inválidas.');
        });

        it('deve retornar 200 e o token JWT se os dados forem válidos', async () => {
            const hash = await bcrypt.hash('senhaCorreta', 10);
            usuarioRepository.findByCpf.mockResolvedValue({ usuario_id: 'fake-uuid' });
            usuarioRepository.findById.mockResolvedValue({ id: 'fake-uuid', ativo: true, senha_hash: hash });
            
            const res = await request(app).post('/auth/login').send({ cpf: '123', senha: 'senhaCorreta' });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
        });
    });

    describe('Middleware authenticate.js', () => {
        // Criar uma rota fake dentro da suíte de testes para testar o middleware
        const testApp = express();
        testApp.get('/protected', authenticate, (req, res) => {
            res.status(200).json({ userId: req.user.id });
        });

        it('deve bloquear acesso sem token (401)', async () => {
            const res = await request(testApp).get('/protected');
            expect(res.status).toBe(401);
            expect(res.body.error).toMatch(/não fornecido/);
        });

        it('deve bloquear token inválido (401)', async () => {
            const res = await request(testApp).get('/protected').set('Authorization', 'Bearer token_invalido_aqui');
            expect(res.status).toBe(401);
            expect(res.body.error).toMatch(/inválido ou expirado/);
        });

        it('deve permitir acesso com token válido e injetar req.user.id (200)', async () => {
            const token = jwt.sign({ sub: 'uuid-valido' }, process.env.JWT_SECRET || 'super_secret_key_tcc');
            const res = await request(testApp)
                .get('/protected')
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.status).toBe(200);
            expect(res.body.userId).toBe('uuid-valido');
        });
    });
});
