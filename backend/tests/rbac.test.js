const request = require('supertest');
const express = require('express');
const requireTenantRoles = require('../src/middleware/authTenantRbac');
const tenantRepository = require('../src/repositories/tenant.repository');

jest.mock('../src/repositories/tenant.repository');

describe('Middleware authTenantRbac (RBAC)', () => {
    let app;

    beforeAll(() => {
        app = express();
        
        // Simular o authenticate.js que roda antes
        app.use((req, res, next) => {
            // Em tese, pegou o ID via token JWT
            req.user = { id: 'uuid-do-usuario-logado' };
            next();
        });

        // Rota protegida de teste
        app.get('/diagnosticos', requireTenantRoles('MEDICO', 'DONO'), (req, res) => {
            res.status(200).json({ ok: true, tenant: req.tenant });
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve rejeitar se Header X-Tenant-ID estiver ausente (400)', async () => {
        const res = await request(app).get('/diagnosticos');
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/ausente/);
    });

    it('deve rejeitar se Header X-Tenant-ID for um UUID inválido (400)', async () => {
        const res = await request(app).get('/diagnosticos').set('X-Tenant-ID', 'id-malicioso');
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/inválido/);
    });

    it('deve rejeitar se usuário não pertencer a este tenant, ou seja, buscar DB retornar nulo (403)', async () => {
        tenantRepository.findUserInTenant.mockResolvedValue(null);
        
        const res = await request(app)
            .get('/diagnosticos')
            .set('X-Tenant-ID', 'd290f1ee-6c54-4b01-90e6-d701748f0851');
            
        expect(res.status).toBe(403);
        expect(res.body.error).toMatch(/não pertence/);
    });

    it('deve rejeitar se usuário estiver inativo no tenant (403)', async () => {
        tenantRepository.findUserInTenant.mockResolvedValue({
            ativo: false,
            papeis: ['MEDICO']
        });
        
        const res = await request(app)
            .get('/diagnosticos')
            .set('X-Tenant-ID', 'd290f1ee-6c54-4b01-90e6-d701748f0851');
            
        expect(res.status).toBe(403);
        expect(res.body.error).toMatch(/inativo/);
    });

    it('deve rejeitar se um PACIENTE tentar acessar rota exclusiva de MEDICO/DONO (403)', async () => {
        tenantRepository.findUserInTenant.mockResolvedValue({
            ativo: true,
            papeis: ['PACIENTE']
        });
        
        const res = await request(app)
            .get('/diagnosticos')
            .set('X-Tenant-ID', 'd290f1ee-6c54-4b01-90e6-d701748f0851');
            
        expect(res.status).toBe(403);
        expect(res.body.error).toMatch(/Papel insuficiente/);
    });

    it('deve autorizar se MEDICO tentar acessar a rota, guardando os dados em req.tenant (200)', async () => {
        tenantRepository.findUserInTenant.mockResolvedValue({
            ativo: true,
            papeis: ['PACIENTE', 'MEDICO'] // Usuário possui as duas credenciais
        });
        
        const res = await request(app)
            .get('/diagnosticos')
            .set('X-Tenant-ID', 'd290f1ee-6c54-4b01-90e6-d701748f0851');
            
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        
        // Verifica se a Request armazenou corretamente os dados para uso nos controllers
        expect(res.body.tenant.id).toBe('d290f1ee-6c54-4b01-90e6-d701748f0851');
        expect(res.body.tenant.papeis).toEqual(['PACIENTE', 'MEDICO']);
    });

    it('deve autorizar se DONO tentar acessar a rota (200)', async () => {
        tenantRepository.findUserInTenant.mockResolvedValue({
            ativo: true,
            papeis: ['DONO'] 
        });
        
        const res = await request(app)
            .get('/diagnosticos')
            .set('X-Tenant-ID', 'd290f1ee-6c54-4b01-90e6-d701748f0851');
            
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
    });
});
