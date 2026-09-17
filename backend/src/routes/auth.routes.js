const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const authenticate = require('../middleware/authenticate');

router.post('/login', authController.login);
router.get('/check-cpf/:cpf', authController.checkCpf);
router.post('/selecionar-papel', authenticate, authController.selecionarPapel);

module.exports = router;
