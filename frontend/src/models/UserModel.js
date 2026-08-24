/**
 * UserModel - Holds validation schemas, formatting and parsing rules
 * in compliance with backend models: usuario, medico, and tenant.
 */
class UserModel {
  // --- Formatter Utilities ---

  /**
   * Formats a raw number string as a CPF: 000.000.000-00
   */
  formatCpf(value) {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  }

  /**
   * Formats a raw number string as a CNPJ: 00.000.000/0000-00
   */
  formatCnpj(value) {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  }

  // --- Parser Utilities ---

  /**
   * Strips all non-digits from a string
   */
  stripNonDigits(value) {
    if (!value) return '';
    return value.replace(/\D/g, '');
  }

  // --- Validation Utilities ---

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email && emailRegex.test(email);
  }

  validatePassword(password) {
    return password && password.length >= 8;
  }

  validateCpf(cpf) {
    const cleanCpf = this.stripNonDigits(cpf);
    return cleanCpf.length === 11;
  }

  validateCnpj(cnpj) {
    const cleanCnpj = this.stripNonDigits(cnpj);
    return cleanCnpj.length === 14;
  }

  validateCrmUf(uf) {
    return uf && uf.trim().length === 2;
  }

  /**
   * Validates form inputs according to the chosen role.
   * Throws descriptive errors if any field is invalid.
   */
  validateRegistration(fields, role) {
    const { cpf, nome_completo, email, senha } = fields;

    // 1. Common User Fields
    if (!nome_completo || nome_completo.trim().length === 0) {
      throw new Error('Nome completo é obrigatório.');
    }

    if (!this.validateCpf(cpf)) {
      throw new Error('CPF inválido. Deve conter exatamente 11 dígitos.');
    }

    if (!this.validateEmail(email)) {
      throw new Error('E-mail inválido.');
    }

    if (!this.validatePassword(senha)) {
      throw new Error('A senha deve conter no mínimo 8 caracteres.');
    }

    // 2. Role Specific Fields
    if (role === 'MEDICO') {
      const { crm, uf_crm, especialidade } = fields;
      if (!crm || crm.trim().length === 0) {
        throw new Error('CRM é obrigatório.');
      }
      if (!this.validateCrmUf(uf_crm)) {
        throw new Error('UF do CRM deve conter exatamente 2 caracteres.');
      }
      if (!especialidade || especialidade.trim().length === 0) {
        throw new Error('Especialidade é obrigatória.');
      }
    } else if (role === 'DONO') {
      const { cnpj, razao_social, nome_fantasia } = fields;
      if (!this.validateCnpj(cnpj)) {
        throw new Error('CNPJ inválido. Deve conter exatamente 14 dígitos.');
      }
      if (!razao_social || razao_social.trim().length === 0) {
        throw new Error('Razão social é obrigatória.');
      }
      if (!nome_fantasia || nome_fantasia.trim().length === 0) {
        throw new Error('Nome fantasia é obrigatório.');
      }
    }

    return true;
  }
}

export default new UserModel();
