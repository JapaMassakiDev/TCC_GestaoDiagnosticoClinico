const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');

router.post('/', usuarioController.criarUsuario);
router.get('/cpf/:cpf', usuarioController.buscarUsuarioPorCpf);

module.exports = router;
