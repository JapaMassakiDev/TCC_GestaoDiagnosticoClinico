module.exports = {
    table_name: 'tenants_por_cnpj',
    fields: {
        cnpj: 'text',
        tenant_id: 'uuid',
        razao_social: 'text',
        nome_fantasia: 'text',
        ativo: 'boolean'
    },
    key: ['cnpj'],
    before_save: function (instance, options) {
        if (instance.cnpj && instance.cnpj.length !== 14) {
            throw new Error('Validação falhou: O CNPJ deve conter exatamente 14 dígitos.');
        }
        return true;
    }
};
