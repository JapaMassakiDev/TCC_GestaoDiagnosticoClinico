const express = require('express');
const router = express.Router();
const diagnosticoController = require('../controllers/diagnostico.controller');
const authenticate = require('../middleware/authenticate');
const requireTenantRoles = require('../middleware/authTenantRbac');

// GET /pacientes/:pacienteId/diagnosticos
// Autorização: PACIENTE (ver o seu próprio), MEDICO ou DONO (ver de qualquer um no tenant)
router.get('/:pacienteId/diagnosticos', authenticate, requireTenantRoles('MEDICO', 'DONO', 'PACIENTE'), diagnosticoController.listarHistoricoPaciente);

module.exports = router;
