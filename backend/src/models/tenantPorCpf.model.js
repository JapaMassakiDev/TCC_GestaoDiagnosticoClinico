module.exports = {
    table_name: 'tenants_por_cpf',
    fields: {
        cpf: 'text',
        tenant_id: 'uuid',
        razao_social: 'text',
        nome_fantasia: 'text',
        ativo: 'boolean'
    },
    key: ['cpf'],
    before_save: function (instance, options) {
        if (instance.cpf && instance.cpf.length !== 11) {
            throw new Error('Validação falhou: O CPF deve conter exatamente 11 dígitos.');
        }
        return true;
    }
};
