const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');

router.post('/', usuarioController.criarUsuario);
router.get('/cpf/:cpf', usuarioController.buscarUsuarioPorCpf);
router.put('/:id/papeis', usuarioController.adicionarPapel);

module.exports = router;
