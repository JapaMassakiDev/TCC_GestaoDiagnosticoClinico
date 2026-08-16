const schemas = require('../models');

class MedicoRepository {
    async findById(usuario_id) {
        return await schemas.Medico.findOneAsync({ usuario_id });
    }
}

module.exports = new MedicoRepository();
