const schemas = require('../models');
const { models } = require('../config/database');
const ExpressCassandra = require('express-cassandra');

class UsuarioRepository {
    async findByCpf(cpf) {
        return await schemas.UsuarioPorCpf.findOneAsync({ cpf });
    }

    async findById(id) {
        return await schemas.Usuario.findOneAsync({ id });
    }

    async findByEmail(email) {
        return await schemas.UsuarioPorEmail.findOneAsync({ email });
    }

    async create(usuarioData) {
        const id = ExpressCassandra.uuid();
        const timestamp = new Date();
        
        const usuario = new schemas.Usuario({
            ...usuarioData,
            id,
            ativo: true,
            created_at: timestamp,
            updated_at: timestamp
        });

        const usuarioPorCpf = new schemas.UsuarioPorCpf({
            cpf: usuarioData.cpf,
            usuario_id: id,
            nome_completo: usuarioData.nome_completo,
            email: usuarioData.email,
            ativo: true
        });

        const usuarioPorEmail = new schemas.UsuarioPorEmail({
            email: usuarioData.email,
            usuario_id: id,
            cpf: usuarioData.cpf,
            nome_completo: usuarioData.nome_completo,
            ativo: true
        });

        // Batch execution para atomicidade no Cassandra
        const queries = [
            usuario.save({ return_query: true }),
            usuarioPorCpf.save({ return_query: true }),
            usuarioPorEmail.save({ return_query: true })
        ];

        return new Promise((resolve, reject) => {
            models.doBatch(queries, (err) => {
                if (err) return reject(err);
                resolve(id);
            });
        });
    }
}

module.exports = new UsuarioRepository();
