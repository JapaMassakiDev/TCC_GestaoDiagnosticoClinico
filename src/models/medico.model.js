module.exports = {
    table_name: 'medicos',
    fields: {
        usuario_id: 'uuid',
        crm: 'text',
        uf_crm: 'text',
        especialidade: 'text',
        ativo: 'boolean',
        created_at: 'timestamp',
        updated_at: 'timestamp'
    },
    key: ['usuario_id'],
    before_save: function (instance, options) {
        if (instance.uf_crm && instance.uf_crm.length !== 2) {
            throw new Error('Validação falhou: A UF do CRM deve conter exatamente 2 caracteres.');
        }
        return true;
    }
};
