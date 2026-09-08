const { cid11MockData } = require('./data/cid11.data.js');
const { sngpcMockData } = require('./data/sngpc.data.js');

class IntegrationsService {
  async fetchCep(cep) {
    const cleanCep = String(cep).replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      throw new Error('CEP inv\u00e1lido.');
    }
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    if (data.erro) {
      throw new Error('CEP n\u00e3o encontrado.');
    }
    return data;
  }

  async fetchCnpj(cnpj) {
    const cleanCnpj = String(cnpj).replace(/\D/g, '');
    if (cleanCnpj.length !== 14) {
      throw new Error('CNPJ inv\u00e1lido.');
    }
    // Utilizando a BrasilAPI, que reflete a Receita Federal
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
    if (!response.ok) {
      throw new Error('CNPJ n\u00e3o encontrado na Receita Federal.');
    }
    const data = await response.json();
    return data;
  }

  async searchCid11(query = '') {
    const text = String(query).trim().toLowerCase();
    if (!text) return cid11MockData;
    return cid11MockData.filter((item) => 
      `${item.code} ${item.title} ${item.description}`.toLowerCase().includes(text)
    ).slice(0, 20);
  }

  async searchSngpc(query = '') {
    const text = String(query).trim().toLowerCase();
    if (!text) return sngpcMockData.slice(0, 20);
    return sngpcMockData.filter((item) => 
      `${item.name} ${item.activeIngredient}`.toLowerCase().includes(text)
    ).slice(0, 20);
  }
}

module.exports = new IntegrationsService();
