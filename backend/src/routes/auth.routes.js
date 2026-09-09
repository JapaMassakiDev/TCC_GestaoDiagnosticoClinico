const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/login', authController.login);
router.get('/check-cpf/:cpf', authController.checkCpf);

module.exports = router;
