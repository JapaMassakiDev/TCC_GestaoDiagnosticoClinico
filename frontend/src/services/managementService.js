import { MOCK_MODE, apiFetch } from "./api";
import { onlyDigits } from "../utils/masks";
import {
  addDoctorToUnitMock,
  findDoctorByCrmMock,
  getMyUnitMock,
  getOwnerDashboardMock,
  getUnitKpisMock,
  listUnitDoctorsMock,
  removeDoctorFromUnitMock,
} from "../mock/managementMock";

export async function getMyUnit(ownerId) {
  if (!MOCK_MODE) return apiFetch("/units/my-unit");
  return getMyUnitMock(ownerId);
}

export async function getUnitKpis(ownerId) {
  if (!MOCK_MODE) return apiFetch("/units/my-unit/kpis");
  return getUnitKpisMock(ownerId);
}

export async function listUnitDoctors(ownerId) {
  if (!MOCK_MODE) return apiFetch("/units/my-unit/doctors");
  return listUnitDoctorsMock(ownerId);
}

export async function findDoctorByCrm(crm) {
  const cleanCrm = onlyDigits(crm);
  if (!MOCK_MODE) return apiFetch(`/doctors/by-crm/${cleanCrm}`);
  return findDoctorByCrmMock(cleanCrm);
}

export async function addDoctorToUnit(ownerId, crm) {
  const cleanCrm = onlyDigits(crm);
  if (!MOCK_MODE) {
    return apiFetch("/units/my-unit/doctors", {
      method: "POST",
      body: JSON.stringify({ crm: cleanCrm }),
    });
  }
  return addDoctorToUnitMock(ownerId, cleanCrm);
}

export async function removeDoctorFromUnit(ownerId, doctorId) {
  if (!MOCK_MODE) {
    return apiFetch(`/units/my-unit/doctors/${doctorId}`, {
      method: "DELETE",
    });
  }
  return removeDoctorFromUnitMock(ownerId, doctorId);
}

export async function getOwnerDashboard(ownerId) {
  if (!MOCK_MODE) return apiFetch("/units/my-unit/dashboard");
  return getOwnerDashboardMock(ownerId);
}
