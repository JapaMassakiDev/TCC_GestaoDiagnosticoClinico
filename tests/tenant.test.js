const request = require('supertest');
const app = require('../src/app');
const tenantRepository = require('../src/repositories/tenant.repository');
const jwt = require('jsonwebtoken');

jest.mock('../src/repositories/tenant.repository');

describe('Cadastro de Instituição (Tenant)', () => {
    let token;

    beforeAll(() => {
        // Gerar um token fake para simular um usuário logado
        token = jwt.sign({ sub: 'uuid-do-usuario-logado' }, process.env.JWT_SECRET || 'super_secret_key_tcc');
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve bloquear a requisição se não enviar token (401)', async () => {
        const response = await request(app).post('/tenants').send({
            cnpj: '12345678901234',
            razao_social: 'Clínica A',
            nome_fantasia: 'Clínica A'
        });
        
        expect(response.status).toBe(401);
    });

    it('deve cadastrar uma instituição com sucesso (201)', async () => {
        tenantRepository.findByCnpj.mockResolvedValue(null);
        tenantRepository.create.mockResolvedValue('uuid-novo-tenant');

        const response = await request(app)
            .post('/tenants')
            .set('Authorization', `Bearer ${token}`)
            .send({
                cnpj: '12345678901234',
                razao_social: 'Clínica Saúde',
                nome_fantasia: 'Saúde Mais'
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Instituição criada com sucesso');
        expect(response.body.data.papeis).toEqual(['DONO', 'PACIENTE']);
        expect(tenantRepository.create).toHaveBeenCalled();
    });

    it('deve falhar se o CNPJ for inválido (400)', async () => {
        const response = await request(app)
            .post('/tenants')
            .set('Authorization', `Bearer ${token}`)
            .send({
                cnpj: '123', // Tamanho inválido
                razao_social: 'Clínica Saúde',
                nome_fantasia: 'Saúde Mais'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/exatamente 14 dígitos/);
        expect(tenantRepository.create).not.toHaveBeenCalled();
    });

    it('deve falhar se a Razão Social estiver faltando (400)', async () => {
        const response = await request(app)
            .post('/tenants')
            .set('Authorization', `Bearer ${token}`)
            .send({
                cnpj: '12345678901234',
                nome_fantasia: 'Saúde Mais'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/obrigatórios/);
    });

    it('deve falhar se o CNPJ já estiver cadastrado (400)', async () => {
        tenantRepository.findByCnpj.mockResolvedValue({ cnpj: '12345678901234' });

        const response = await request(app)
            .post('/tenants')
            .set('Authorization', `Bearer ${token}`)
            .send({
                cnpj: '12345678901234',
                razao_social: 'Clínica Saúde',
                nome_fantasia: 'Saúde Mais'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/já cadastrado/);
        expect(tenantRepository.create).not.toHaveBeenCalled();
    });
});
