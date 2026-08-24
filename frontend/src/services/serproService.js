/**
 * SERPRO CPF Consultation API Integration Service (Future Planning)
 * 
 * SERPRO offers endpoints like:
 * GET https://gateway.apiprocesso.serpro.gov.br/consulta-cpf-df/v1/cpf/{cpf}
 * Authorized by Bearer tokens retrieved using consumer key and secret.
 */
class SerproService {
  constructor() {
    this.baseUrl = 'https://gateway.apiprocesso.serpro.gov.br/consulta-cpf-df/v1';
    this.consumerKey = 'YOUR_SERPRO_CONSUMER_KEY';
    this.consumerSecret = 'YOUR_SERPRO_CONSUMER_SECRET';
  }

  /**
   * Fetches CPF details from SERPRO.
   * Currently mocked to populate user information automatically during sign up.
   * 
   * @param {string} cpf - Raw or masked CPF digits
   * @returns {Promise<{ nomeCompleto: string, situacao: string }>}
   */
  async consultCpf(cpf) {
    const cleanCpf = cpf.replace(/\D/g, '');

    if (cleanCpf.length !== 11) {
      throw new Error('CPF deve conter exatamente 11 dígitos para consulta.');
    }

    // Simulando chamada HTTP de 800ms para a API do SERPRO
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Base de dados Mock para demonstração baseada em CPF de teste
    if (cleanCpf === '12345678901') {
      return {
        nomeCompleto: 'João da Silva Santos',
        situacao: 'REGULAR',
        dataNascimento: '15/04/1985',
      };
    } else if (cleanCpf === '98765432100') {
      return {
        nomeCompleto: 'Dra. Ana Maria Oliveira',
        situacao: 'REGULAR',
        dataNascimento: '22/10/1978',
      };
    } else if (cleanCpf === '11111111111') {
      return {
        nomeCompleto: 'Dr. Emerson da Costa',
        situacao: 'REGULAR',
        dataNascimento: '01/01/1990',
      };
    }

    // Default mock response for other CPFs
    return {
      nomeCompleto: 'Usuário Demo SERPRO',
      situacao: 'REGULAR',
      dataNascimento: '10/05/1992',
    };

    /*
    // EXEMPLO DE IMPLEMENTAÇÃO REAL:
    try {
      // 1. Obter Token de Acesso do Gateway do SERPRO
      const tokenResponse = await fetch('https://gateway.apiprocesso.serpro.gov.br/token', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(this.consumerKey + ':' + this.consumerSecret),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });
      const tokenData = await tokenResponse.json();
      
      // 2. Consultar CPF com o token
      const cpfResponse = await fetch(`${this.baseUrl}/cpf/${cleanCpf}`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });
      
      if (!cpfResponse.ok) {
        throw new Error('Erro na consulta do CPF junto ao SERPRO.');
      }
      
      const cpfData = await cpfResponse.json();
      return {
        nomeCompleto: cpfData.nome,
        situacao: cpfData.situacao.descricao,
        dataNascimento: cpfData.nascimento
      };
    } catch (error) {
      console.error('Falha na integração real com o SERPRO:', error);
      throw error;
    }
    */
  }
}

export default new SerproService();
