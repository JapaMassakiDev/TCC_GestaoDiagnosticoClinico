const express = require('express');
const router = express.Router();
const diagnosticoController = require('../controllers/diagnostico.controller');
const authenticate = require('../middleware/authenticate');
const requireTenantRoles = require('../middleware/authTenantRbac');

// A cadeia de segurança: Token JWT Válido -> Papel de Médico Ativo na Clínica -> Controller
router.post('/', authenticate, requireTenantRoles('MEDICO'), diagnosticoController.criarDiagnostico);

// Consultar todos do Tenant
router.get('/', authenticate, requireTenantRoles('MEDICO', 'DONO'), diagnosticoController.listarDiagnosticos);

// Cancelar diagnóstico (Somente Médico)
router.patch('/:id/cancelar', authenticate, requireTenantRoles('MEDICO'), diagnosticoController.cancelarDiagnostico);

module.exports = router;
