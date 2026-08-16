module.exports = {
    table_name: 'diagnosticos_por_paciente',
    fields: {
        tenant_id: 'uuid',
        paciente_id: 'uuid',
        diagnostico_id: 'uuid',
        medico_id: 'uuid',
        titulo: 'text',
        descricao: 'text',
        codigo_cid: 'text',
        status: 'text',
        created_at: 'timestamp',
        updated_at: 'timestamp'
    },
    key: [['tenant_id', 'paciente_id'], 'created_at', 'diagnostico_id'],
    clustering_order: {
        created_at: 'desc'
    },
    before_save: function (instance, options) {
        const allowedStatuses = ['ATIVO', 'CANCELADO'];
        if (instance.status && !allowedStatuses.includes(instance.status)) {
            throw new Error(`Validação falhou: O status '${instance.status}' não é permitido. Use: ATIVO ou CANCELADO.`);
        }
        return true;
    }
};
