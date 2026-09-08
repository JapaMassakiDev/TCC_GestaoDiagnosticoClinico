const express = require('express');
const router = express.Router();
const integrationsController = require('../controllers/integrations.controller');

// N\u00e3o requer token JWT pois s\u00e3o usadas tamb\u00e9m no registro n\u00e3o autenticado
router.get('/viacep/:cep', integrationsController.getCep);
router.get('/cnpj/:cnpj', integrationsController.getCnpj);
router.get('/cid', integrationsController.searchCid);
router.get('/sngpc', integrationsController.searchSngpc);

module.exports = router;
