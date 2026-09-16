const schemas = require('../models');
const { models } = require('../config/database');
const ExpressCassandra = require('express-cassandra');

class TenantRepository {
    async findByCnpj(cnpj) {
        return await schemas.TenantPorCnpj.findOneAsync({ cnpj });
    }

    async findUserInTenant(tenantId, usuarioId) {
        return await schemas.TenantUsuarioPorTenant.findOneAsync({ 
            tenant_id: ExpressCassandra.uuid(tenantId), 
            usuario_id: ExpressCassandra.uuid(usuarioId) 
        });
    }

    async findByCpf(cpf) {
        return await schemas.TenantPorCpf.findOneAsync({ cpf });
    }

    async create(tenantData) {
        const tenantId = ExpressCassandra.uuid();
        const timestamp = new Date();
        const usuarioId = ExpressCassandra.uuid(tenantData.dono_id);

        const tenant = new schemas.Tenant({
            id: tenantId,
            tipo_tenant: tenantData.tipo_tenant,
            cpf: tenantData.cpf,
            cnpj: tenantData.cnpj,
            razao_social: tenantData.razao_social,
            nome_fantasia: tenantData.nome_fantasia,
            dono_id: usuarioId,
            ativo: true,
            created_at: timestamp,
            updated_at: timestamp
        });

        const tenantUsuarioPorTenant = new schemas.TenantUsuarioPorTenant({
            tenant_id: tenantId,
            usuario_id: usuarioId,
            papeis: tenantData.papeis,
            ativo: true,
            created_at: timestamp,
            updated_at: timestamp
        });

        const tenantUsuarioPorUsuario = new schemas.TenantUsuarioPorUsuario({
            usuario_id: usuarioId,
            tenant_id: tenantId,
            tenant_nome: tenantData.nome_fantasia,
            papeis: tenantData.papeis,
            ativo: true
        });

        // Batch execution
        const queries = [
            tenant.save({ return_query: true }),
            tenantUsuarioPorTenant.save({ return_query: true }),
            tenantUsuarioPorUsuario.save({ return_query: true })
        ];

        if (tenantData.tipo_tenant === 'CLINICA') {
            const tenantPorCnpj = new schemas.TenantPorCnpj({
                cnpj: tenantData.cnpj,
                tenant_id: tenantId,
                razao_social: tenantData.razao_social,
                nome_fantasia: tenantData.nome_fantasia,
                ativo: true
            });
            queries.push(tenantPorCnpj.save({ return_query: true }));
        } else if (tenantData.tipo_tenant === 'AUTONOMO') {
            const tenantPorCpf = new schemas.TenantPorCpf({
                cpf: tenantData.cpf,
                tenant_id: tenantId,
                razao_social: tenantData.razao_social,
                nome_fantasia: tenantData.nome_fantasia,
                ativo: true
            });
            queries.push(tenantPorCpf.save({ return_query: true }));
        }

        return new Promise((resolve, reject) => {
            models.doBatch(queries, (err) => {
                if (err) return reject(err);
                resolve(tenantId);
            });
        });
    }
}

module.exports = new TenantRepository();
