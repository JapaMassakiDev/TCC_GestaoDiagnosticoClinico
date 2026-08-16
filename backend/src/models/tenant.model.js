module.exports = {
    table_name: 'tenants',
    fields: {
        id: 'uuid',
        cnpj: 'text',
        razao_social: 'text',
        nome_fantasia: 'text',
        dono_id: 'uuid',
        ativo: 'boolean',
        created_at: 'timestamp',
        updated_at: 'timestamp'
    },
    key: ['id'],
    before_save: function (instance, options) {
        if (instance.cnpj && instance.cnpj.length !== 14) {
            throw new Error('Validação falhou: O CNPJ deve conter exatamente 14 dígitos.');
        }
        return true;
    }
};
