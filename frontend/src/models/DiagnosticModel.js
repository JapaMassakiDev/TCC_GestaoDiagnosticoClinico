/**
 * DiagnosticModel - Defines schemas and validation rules
 * for clinical diagnoses, matching the backend models.
 */
class DiagnosticModel {
  /**
   * Validates a diagnostic emission payload.
   * Throws an error if validation fails.
   */
  validateDiagnostic(fields) {
    const { paciente_id, titulo, descricao, codigo_cid } = fields;

    if (!paciente_id || paciente_id.trim().length === 0) {
      throw new Error('Paciente é obrigatório.');
    }

    if (!titulo || titulo.trim().length < 3) {
      throw new Error('O título do diagnóstico deve conter no mínimo 3 caracteres.');
    }

    if (!descricao || descricao.trim().length < 5) {
      throw new Error('A descrição deve conter no mínimo 5 caracteres.');
    }

    if (!codigo_cid || codigo_cid.trim().length === 0) {
      throw new Error('Código CID é obrigatório.');
    }

    // Validação opcional de formato CID-10 (Ex: A09, U07.1, M54.5)
    const cidRegex = /^[A-Z][0-9][0-9](\.[0-9])?$/i;
    // Opcional: só avisa ou rejeita se não bater
    // if (!cidRegex.test(codigo_cid.trim())) {
    //   throw new Error('Código CID-10 inválido.');
    // }

    return true;
  }

  /**
   * Sanitizes diagnostic data for display.
   */
  sanitizeDiagnostic(diag) {
    return {
      id: diag.id ? diag.id.toString() : '',
      titulo: diag.titulo || 'Sem título',
      descricao: diag.descricao || 'Sem descrição',
      codigo_cid: diag.codigo_cid || 'N/A',
      medico_id: diag.medico_id ? diag.medico_id.toString() : '',
      paciente_id: diag.paciente_id ? diag.paciente_id.toString() : '',
      created_at: diag.created_at ? new Date(diag.created_at).toLocaleDateString('pt-BR') : 'Data não informada',
      status: diag.status || 'EMITIDO',
    };
  }
}

export default new DiagnosticModel();
