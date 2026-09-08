const IntegrationsService = require('../services/integrations.service');

class IntegrationsController {
  async getCep(req, res) {
    try {
      const { cep } = req.params;
      const data = await IntegrationsService.fetchCep(cep);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCnpj(req, res) {
    try {
      const { cnpj } = req.params;
      const data = await IntegrationsService.fetchCnpj(cnpj);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async searchCid(req, res) {
    try {
      const { query } = req.query;
      const data = await IntegrationsService.searchCid11(query);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async searchSngpc(req, res) {
    try {
      const { query } = req.query;
      const data = await IntegrationsService.searchSngpc(query);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new IntegrationsController();
