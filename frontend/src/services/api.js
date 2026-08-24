import axios from 'axios';

// Em ambiente de desenvolvimento com emulador/dispositivo móvel:
// - Android Emulator: usa 10.0.2.2 ou o IP da sua máquina na rede local (ex: 192.168.x.x)
// - iOS Simulator: usa localhost
// - Web: usa localhost
const API_URL = 'http://localhost:3000'; // Alterar para o IP da rede local para testes em dispositivo físico

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper para configurar os tokens e tenantId globalmente
export const setClientHeaders = (token, tenantId) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }

  if (tenantId) {
    api.defaults.headers.common['x-tenant-id'] = tenantId;
  } else {
    delete api.defaults.headers.common['x-tenant-id'];
  }
};

export const authApi = {
  login: async (cpf, senha) => {
    // Envia apenas os números do CPF para o backend
    const cleanCpf = cpf.replace(/\D/g, '');
    const response = await api.post('/auth/login', { cpf: cleanCpf, senha });
    return response.data; // Retorna { token }
  },

  registerUser: async (userData) => {
    // Envia apenas números do CPF
    const payload = {
      ...userData,
      cpf: userData.cpf.replace(/\D/g, ''),
    };
    const response = await api.post('/usuarios', payload);
    return response.data; // Retorna { message, data: { id, cpf, nome_completo, email } }
  },
};

export const tenantApi = {
  createTenant: async (tenantData, token) => {
    // O dono cria a clínica/instituição. Requer o token de autenticação.
    const cleanCnpj = tenantData.cnpj.replace(/\D/g, '');
    const response = await api.post('/tenants', {
      cnpj: cleanCnpj,
      razao_social: tenantData.razao_social,
      nome_fantasia: tenantData.nome_fantasia,
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data; // Retorna { message, data: { id, cnpj, razao_social, nome_fantasia, papeis } }
  },
};

export const diagnosticApi = {
  listDiagnostics: async () => {
    const response = await api.get('/diagnosticos');
    return response.data; // Lista de diagnósticos do tenant ativo
  },

  listPatientDiagnostics: async (pacienteId) => {
    const response = await api.get(`/pacientes/${pacienteId}/diagnosticos`);
    return response.data; // Histórico do paciente no tenant ativo
  },

  emitDiagnostic: async (diagnosticData) => {
    const response = await api.post('/diagnosticos', diagnosticData);
    return response.data; // Emite diagnóstico (Somente Médico)
  },
  
  cancelDiagnostic: async (id) => {
    const response = await api.patch(`/diagnosticos/${id}/cancelar`);
    return response.data; // Cancela diagnóstico (Somente Médico)
  }
};

export default api;
