module.exports = {
    table_name: 'auditoria_por_tenant',
    fields: {
        tenant_id: 'uuid',
        created_at: 'timestamp',
        acao: 'text',
        usuario_id: 'uuid',
        detalhes: 'text' // JSON extra string
    },
    key: [['tenant_id'], 'created_at'],
    clustering_order: {
        created_at: 'desc'
    }
};
