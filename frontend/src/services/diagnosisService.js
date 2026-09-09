import { apiFetch } from "./api";
import { onlyDigits } from "../utils/masks";

export async function findPatientByCpf(cpf) {
  // O backend do TCC n\u00e3o tem endpoint espec\u00edfico pronto, simulando busca vazia para o UI
  return null; 
}

export async function searchPatients(query = "") {
  return []; // Requer implementa\u00e7\u00e3o de rota no backend
}

export async function listDiagnoses(user) {
  if (user.role === 'paciente') {
    return apiFetch(`/pacientes/${user.id}/diagnosticos`).catch(() => []);
  } else {
    // Requer cabe\u00e7alho X-Tenant-ID se formos rigorosos, 
    // mas a UI pode simplificar chamando /diagnosticos
    return apiFetch('/diagnosticos', { headers: { "X-Tenant-ID": user.unitId || "" } }).catch(() => []);
  }
}

export async function listPatientDiagnoses(patientId) {
  return apiFetch(`/pacientes/${patientId}/diagnosticos`).catch(() => []);
}

export async function createDiagnosis(payload) {
  // A UI n\u00e3o possui tenant expl\u00edcito, mas o backend exige X-Tenant-ID.
  // Supondo que pegamos do token ou injetamos vazio e corrigimos.
  return apiFetch("/diagnosticos", { 
    method: "POST", 
    body: JSON.stringify(payload),
    headers: { "X-Tenant-ID": payload.unitId || "" }
  });
}

export async function listTimelines(patientId) {
  return []; // N\u00e3o existe Timelines na modelagem de banco do Cassandra ainda
}

export async function createTimeline(payload) {
  throw new Error("Funcionalidade n\u00e3o implementada no Backend");
}

export async function assignDiagnosesToTimeline(payload) {
  throw new Error("Funcionalidade n\u00e3o implementada no Backend");
}

export const getDoctorUnits = (doctorId) => [];
