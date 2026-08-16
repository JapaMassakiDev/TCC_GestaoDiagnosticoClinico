module.exports = {
    table_name: 'usuarios',
    fields: {
        id: 'uuid',
        cpf: 'text',
        nome_completo: 'text',
        email: 'text',
        senha_hash: 'text',
        ativo: 'boolean',
        created_at: 'timestamp',
        updated_at: 'timestamp'
    },
    key: ['id']
};
