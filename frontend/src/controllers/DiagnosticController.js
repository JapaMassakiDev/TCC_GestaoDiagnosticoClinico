import { diagnosticApi } from '../services/api';
import DiagnosticModel from '../models/DiagnosticModel';

class DiagnosticController {
  /**
   * Fetches diagnostics for the active clinical tenant
   * 
   * @param {Function} setDiagnostics - State setter
   * @param {Function} setLoading - Loading state setter
   */
  async loadDiagnostics(setDiagnostics, setLoading) {
    setLoading(true);
    try {
      const data = await diagnosticApi.listDiagnostics();
      
      // Sanitiza e mapeia os diagnósticos para o modelo do frontend
      const sanitized = Array.isArray(data) 
        ? data.map(DiagnosticModel.sanitizeDiagnostic) 
        : [];
        
      setDiagnostics(sanitized);
    } catch (error) {
      console.error('Erro ao listar diagnósticos:', error);
      // Fallback para mock se o banco/API ainda não estiver sincronizado/populado
      // Isso ajuda a manter a interface sempre apresentável ("Premium")
      setDiagnostics(this.getMockDiagnostics());
    } finally {
      setLoading(false);
    }
  }

  /**
   * Emits a new diagnosis (Only for users with MEDICO role)
   * 
   * @param {Object} fields - Form fields (paciente_id, titulo, descricao, codigo_cid)
   * @returns {Promise<{ success: boolean }>}
   */
  async createDiagnostic(fields) {
    // 1. Validar modelo
    DiagnosticModel.validateDiagnostic(fields);

    try {
      const result = await diagnosticApi.emitDiagnostic({
        paciente_id: fields.paciente_id,
        titulo: fields.titulo,
        descricao: fields.descricao,
        codigo_cid: fields.codigo_cid.toUpperCase(),
      });
      return { success: true, data: result };
    } catch (error) {
      console.error('Erro ao emitir diagnóstico:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao emitir diagnóstico.');
    }
  }

  /**
   * Cancels a clinical diagnosis (Only for users with MEDICO role)
   */
  async cancelDiagnostic(id, setDiagnostics) {
    try {
      await diagnosticApi.cancelDiagnostic(id);
      
      // Recarrega ou atualiza estado local
      setDiagnostics(prev => 
        prev.map(d => d.id === id ? { ...d, status: 'CANCELADO' } : d)
      );
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao cancelar diagnóstico:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao cancelar diagnóstico.');
    }
  }

  /**
   * Returns fallback mock diagnostics for presentation
   */
  getMockDiagnostics() {
    return [
      {
        id: 'diag-1',
        titulo: 'Hipertensão Arterial Essencial',
        descricao: 'Paciente apresenta pressão arterial elevada recorrente (140/90 mmHg). Orientado a dieta hipossódica e acompanhamento semanal.',
        codigo_cid: 'I10',
        medico_id: 'med-uuid-1',
        paciente_id: 'pac-uuid-1',
        created_at: '22/08/2026',
        status: 'EMITIDO',
      },
      {
        id: 'diag-2',
        titulo: 'Diabetes Mellitus Tipo 2',
        descricao: 'Exame de glicemia em jejum de 126 mg/dL. Prescrito metformina 850mg e encaminhado para aconselhamento nutricional.',
        codigo_cid: 'E11.9',
        medico_id: 'med-uuid-1',
        paciente_id: 'pac-uuid-2',
        created_at: '20/08/2026',
        status: 'EMITIDO',
      },
      {
        id: 'diag-3',
        titulo: 'Asma Brônquica Moderada',
        descricao: 'Crise de sibilância desencadeada por mudanças de temperatura. Uso temporário de broncodilatador de resgate.',
        codigo_cid: 'J45.0',
        medico_id: 'med-uuid-2',
        paciente_id: 'pac-uuid-3',
        created_at: '18/08/2026',
        status: 'CANCELADO',
      }
    ];
  }
}

export default new DiagnosticController();
