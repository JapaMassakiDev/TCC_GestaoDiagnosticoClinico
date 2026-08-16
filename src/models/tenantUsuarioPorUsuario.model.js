module.exports = {
    table_name: 'tenant_usuarios_por_usuario',
    fields: {
        usuario_id: 'uuid',
        tenant_id: 'uuid',
        tenant_nome: 'text',
        papeis: {
            type: 'set',
            typeDef: '<text>'
        },
        ativo: 'boolean'
    },
    key: [['usuario_id'], 'tenant_id'],
    before_save: function (instance, options) {
        const allowedRoles = ['DONO', 'MEDICO', 'PACIENTE'];
        if (instance.papeis && Array.isArray(instance.papeis)) {
            instance.papeis.forEach(papel => {
                if (!allowedRoles.includes(papel)) {
                    throw new Error(`Validação falhou: O papel '${papel}' não é permitido.`);
                }
            });
        }
        return true;
    }
};
