import { authApi, tenantApi, setClientHeaders } from '../services/api';
import UserModel from '../models/UserModel';

class AuthController {
  /**
   * Handles user login.
   * If login fails because user does not exist, triggers a redirect to sign up.
   * 
   * @param {string} cpf - Masked or raw CPF
   * @param {string} password - User password
   * @param {Object} navigation - App navigator controller
   * @param {Function} setAuthState - Auth state setter from Context
   */
  async login(cpf, password, navigation, setAuthState) {
    const cleanCpf = UserModel.stripNonDigits(cpf);

    if (!UserModel.validateCpf(cleanCpf)) {
      throw new Error('CPF deve conter exatamente 11 dígitos.');
    }
    if (!password) {
      throw new Error('Senha é obrigatória.');
    }

    try {
      // 1. Chamar API de login do backend
      const result = await authApi.login(cleanCpf, password);
      const token = result.token;

      // Decodifica ou analisa o papel do usuário (Mock por simplicidade no front)
      // Como o JWT do backend do TCC apenas contém o "sub" (id do usuário),
      // em um cenário real faríamos um GET /usuarios/me para pegar o perfil.
      // Aqui, vamos determinar o papel com base em dados salvos ou regras padrão:
      // Se for CPF de teste comecando com 1 = médico, comecando com 2 = dono, outros = paciente
      let role = 'PACIENTE';
      if (cleanCpf.startsWith('1')) {
        role = 'MEDICO';
      } else if (cleanCpf.startsWith('2')) {
        role = 'DONO';
      }

      // Configura os cabeçalhos das requisições futuras com o token
      // Para demonstração, usamos um mock de Tenant ID se não houver um ativo.
      const mockTenantId = '3238914d-93e1-456c-8cd5-60b64d0d750c';
      setClientHeaders(token, mockTenantId);

      const user = {
        id: 'user-uuid',
        cpf: cleanCpf,
        nome_completo: 'Usuário Logado',
        email: 'user@teste.com',
      };

      setAuthState({
        token,
        user,
        role,
        activeTenantId: mockTenantId,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error) {
      console.error('Erro de login no AuthController:', error);
      
      // O backend do TCC retorna status 401 com "Credenciais inválidas."
      // Quando não encontrar o usuário no lookup.
      // Se falhar o login, assumimos que o CPF pode não estar cadastrado,
      // direcionando automaticamente para a tela de cadastro e preenchendo o CPF.
      if (error.response && (error.response.status === 401 || error.response.status === 404)) {
        // Redireciona para cadastro preenchendo o CPF
        navigation.navigate('Register', { cpf: cleanCpf });
        throw new Error('Usuário não cadastrado. Direcionando para tela de cadastro...');
      }

      throw new Error(error.response?.data?.error || error.message || 'Erro ao realizar login.');
    }
  }

  /**
   * Handles user registration depending on the selected role.
   * 
   * @param {Object} formFields - All form fields from View state
   * @param {string} role - PACIENTE, MEDICO, or DONO
   * @param {Object} navigation - App navigator controller
   * @param {Function} setAuthState - Auth state setter from Context
   */
  async register(formFields, role, navigation, setAuthState) {
    // 1. Validar modelo
    UserModel.validateRegistration(formFields, role);

    const cleanCpf = UserModel.stripNonDigits(formFields.cpf);
    const cleanCnpj = UserModel.stripNonDigits(formFields.cnpj);

    try {
      // 2. Criar Usuário Base no Backend (POST /usuarios)
      const registerResult = await authApi.registerUser({
        cpf: cleanCpf,
        nome_completo: formFields.nome_completo,
        email: formFields.email,
        senha: formFields.senha,
      });

      const userId = registerResult.data.id;
      let token = null;
      let activeTenantId = null;

      // 3. Processar regras específicas de papel
      if (role === 'PACIENTE') {
        // Fluxo de paciente simples: realiza login automático após cadastro
        const loginResult = await authApi.login(cleanCpf, formFields.senha);
        token = loginResult.token;
        activeTenantId = '3238914d-93e1-456c-8cd5-60b64d0d750c'; // Tenant padrão
      }
      
      else if (role === 'MEDICO') {
        // Fluxo de médico: cadastra usuário, faz login e envia dados do CRM
        const loginResult = await authApi.login(cleanCpf, formFields.senha);
        token = loginResult.token;
        activeTenantId = '3238914d-93e1-456c-8cd5-60b64d0d750c'; // Tenant padrão

        // Salvar perfil do Médico (Chama endpoint simulado /medicos)
        console.log('Registrando dados médicos no banco:', {
          usuario_id: userId,
          crm: formFields.crm,
          uf_crm: formFields.uf_crm.toUpperCase(),
          especialidade: formFields.especialidade,
        });
      }
      
      else if (role === 'DONO') {
        // Fluxo de dono de clínica (Tenant):
        // Primeiro faz o login para obter o JWT
        const loginResult = await authApi.login(cleanCpf, formFields.senha);
        token = loginResult.token;

        // Cria a clínica (Tenant) enviando o CNPJ e razão social (POST /tenants)
        const tenantResult = await tenantApi.createTenant({
          cnpj: cleanCnpj,
          razao_social: formFields.razao_social,
          nome_fantasia: formFields.nome_fantasia,
        }, token);

        activeTenantId = tenantResult.data.id;
      }

      // Atualiza os headers globais da API
      setClientHeaders(token, activeTenantId);

      // Define estado global autenticado
      setAuthState({
        token,
        user: {
          id: userId,
          cpf: cleanCpf,
          nome_completo: formFields.nome_completo,
          email: formFields.email,
        },
        role,
        activeTenantId,
        isAuthenticated: true,
      });

      // Redireciona para o app principal
      navigation.navigate('App');

      return { success: true };
    } catch (error) {
      console.error('Erro de cadastro no AuthController:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao realizar cadastro.');
    }
  }

  /**
   * Log out user, cleaning local session headers and context state.
   */
  logout(setAuthState, navigation) {
    setClientHeaders(null, null);
    setAuthState({
      token: null,
      user: null,
      role: null,
      activeTenantId: null,
      isAuthenticated: false,
    });
    navigation.navigate('Login');
  }
}

export default new AuthController();
