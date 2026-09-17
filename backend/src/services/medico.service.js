const schemas = require('../models');
const medicoRepository = require('../repositories/medico.repository');
const { models } = require('../config/database');

class MedicoService {
    async create({ usuario_id, crm, uf_crm, especialidade }) {
        if (!crm) {
            throw new Error('CRM é obrigatório para registrar um médico.');
        }

        const idUuid = typeof usuario_id === 'string' ? models.uuidFromString(usuario_id) : usuario_id;

        const exists = await medicoRepository.findById(idUuid);
        if (exists) {
            throw new Error('Usuário já está registrado como médico.');
        }

        const timestamp = new Date();
        const medico = new schemas.Medico({
            usuario_id: idUuid,
            crm,
            uf_crm: uf_crm || null,
            especialidade: especialidade || null,
            ativo: true,
            created_at: timestamp,
            updated_at: timestamp
        });

        await medico.saveAsync();
        return true;
    }
}

module.exports = new MedicoService();
