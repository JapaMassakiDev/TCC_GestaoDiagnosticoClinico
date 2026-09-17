const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const authenticate = require('../middleware/authenticate');

router.post('/', usuarioController.criarUsuario);
router.get('/cpf/:cpf', usuarioController.buscarUsuarioPorCpf);
router.put('/:id/papeis', usuarioController.adicionarPapel);
router.put('/:id', authenticate, usuarioController.atualizarUsuario);

module.exports = router;
