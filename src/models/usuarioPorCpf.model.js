module.exports = {
    table_name: 'usuarios_por_cpf',
    fields: {
        cpf: 'text',
        usuario_id: 'uuid',
        nome_completo: 'text',
        email: 'text',
        ativo: 'boolean'
    },
    key: ['cpf']
};
