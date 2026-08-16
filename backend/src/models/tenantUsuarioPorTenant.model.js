module.exports = {
    table_name: 'tenant_usuarios_por_tenant',
    fields: {
        tenant_id: 'uuid',
        usuario_id: 'uuid',
        papeis: {
            type: 'set',
            typeDef: '<text>'
        },
        ativo: 'boolean',
        created_at: 'timestamp',
        updated_at: 'timestamp'
    },
    key: [['tenant_id'], 'usuario_id'],
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
