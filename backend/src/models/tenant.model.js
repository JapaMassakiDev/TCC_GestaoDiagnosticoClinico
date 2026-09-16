module.exports = {
    table_name: 'tenants',
    fields: {
        id: 'uuid',
        tipo_tenant: 'text',
        cpf: 'text',
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
        if (instance.tipo_tenant === 'CLINICA') {
            if (!instance.cnpj || instance.cnpj.length !== 14) {
                throw new Error('Validação falhou: Para CLINICA, o CNPJ deve conter exatamente 14 dígitos.');
            }
        } else if (instance.tipo_tenant === 'AUTONOMO') {
            if (!instance.cpf || instance.cpf.length !== 11) {
                throw new Error('Validação falhou: Para AUTONOMO, o CPF deve conter exatamente 11 dígitos.');
            }
        }
        return true;
    }
};
