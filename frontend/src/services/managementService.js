import { apiFetch } from "./api";

export async function getMyUnit(ownerId) {
  // Backend placeholder (ainda requer rota dedicada para retornar Tenant por Dono)
  return null;
}

export async function getUnitKpis(ownerId) {
  return null;
}

export async function listUnitDoctors(ownerId) {
  return [];
}

export async function findDoctorByCrm(crm) {
  return null;
}

export async function addDoctorToUnit(ownerId, crm) {
  throw new Error("Rota n\u00e3o implementada no Backend");
}

export async function removeDoctorFromUnit(ownerId, doctorId) {
  throw new Error("Rota n\u00e3o implementada no Backend");
}

export async function getOwnerDashboard(ownerId) {
  return null;
}
