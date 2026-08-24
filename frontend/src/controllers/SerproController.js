import serproService from '../services/serproService';
import UserModel from '../models/UserModel';

class SerproController {
  /**
   * Performs CPF consultation on SERPRO database.
   * Auto-populates registration form fields if data is returned.
   * 
   * @param {string} cpf - User CPF (raw or masked)
   * @param {Function} setLoading - State setter for loading indicators
   * @param {Function} onSearchResult - Callback with populated fields on success
   */
  async consultCpf(cpf, setLoading, onSearchResult) {
    const cleanCpf = UserModel.stripNonDigits(cpf);

    if (cleanCpf.length !== 11) {
      throw new Error('Preencha o CPF corretamente com 11 dígitos para consultar.');
    }

    setLoading(true);

    try {
      const data = await serproService.consultCpf(cleanCpf);
      
      if (data && data.nomeCompleto) {
        onSearchResult({
          nome_completo: data.nomeCompleto,
          // Outras informações retornadas pelo SERPRO no futuro
        });
        return { success: true, message: `Dados importados com sucesso do SERPRO. Situação: ${data.situacao}` };
      } else {
        throw new Error('Nenhum registro encontrado para este CPF na base do SERPRO.');
      }
    } catch (error) {
      console.error('Erro de consulta SERPRO:', error);
      throw new Error(error.message || 'Falha ao consultar CPF no SERPRO.');
    } finally {
      setLoading(false);
    }
  }
}

export default new SerproController();
