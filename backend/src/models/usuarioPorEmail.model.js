module.exports = {
    table_name: 'usuarios_por_email',
    fields: {
        email: 'text',
        usuario_id: 'uuid',
        cpf: 'text',
        nome_completo: 'text',
        ativo: 'boolean'
    },
    key: ['email']
};
