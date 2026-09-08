import { mockDiagnoses, mockUnits, mockUsers } from "./database";
import { onlyDigits } from "../utils/masks";

const wait = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

function getOwnerUnit(ownerId) {
  const unit = mockUnits.find((item) => item.ownerId === ownerId);
  if (!unit) throw new Error("Unidade não encontrada para este usuário.");
  return unit;
}

function enrichDoctor(doctor, unitId) {
  const diagnosisCount = mockDiagnoses.filter(
    (item) => item.unitId === unitId && item.doctorId === doctor.id,
  ).length;

  return {
    id: doctor.id,
    name: doctor.name,
    email: doctor.email,
    cpf: doctor.cpf,
    crm: doctor.crm,
    diagnosisCount,
  };
}

export async function getMyUnitMock(ownerId) {
  await wait();
  return { ...getOwnerUnit(ownerId) };
}

export async function getUnitKpisMock(ownerId) {
  await wait();
  const unit = getOwnerUnit(ownerId);
  const totalConsultations = mockDiagnoses.filter((item) => item.unitId === unit.id).length;
  return {
    totalConsultations,
    linkedDoctors: unit.doctorIds.length,
  };
}

export async function listUnitDoctorsMock(ownerId) {
  await wait();
  const unit = getOwnerUnit(ownerId);
  return unit.doctorIds
    .map((doctorId) => mockUsers.find((item) => item.id === doctorId && item.role === "medico"))
    .filter(Boolean)
    .map((doctor) => enrichDoctor(doctor, unit.id));
}

export async function findDoctorByCrmMock(crm) {
  await wait();
  const cleanCrm = onlyDigits(crm);
  const doctor = mockUsers.find(
    (item) => item.role === "medico" && onlyDigits(item.crm) === cleanCrm,
  );
  if (!doctor) return null;
  return {
    id: doctor.id,
    name: doctor.name,
    email: doctor.email,
    cpf: doctor.cpf,
    crm: doctor.crm,
  };
}

export async function addDoctorToUnitMock(ownerId, crm) {
  await wait();
  const unit = getOwnerUnit(ownerId);
  const doctor = await findDoctorByCrmMock(crm);

  if (!doctor) throw new Error("Médico não encontrado pelo CRM.");
  if (unit.doctorIds.includes(doctor.id)) {
    throw new Error("Este médico já está vinculado à unidade.");
  }

  unit.doctorIds.push(doctor.id);
  const storedDoctor = mockUsers.find((item) => item.id === doctor.id);
  storedDoctor.unitIds = Array.from(new Set([...(storedDoctor.unitIds || []), unit.id]));

  return enrichDoctor(storedDoctor, unit.id);
}

export async function removeDoctorFromUnitMock(ownerId, doctorId) {
  await wait();
  const unit = getOwnerUnit(ownerId);

  if (!unit.doctorIds.includes(doctorId)) {
    throw new Error("Este médico não está vinculado à unidade.");
  }

  unit.doctorIds = unit.doctorIds.filter((id) => id !== doctorId);
  const doctor = mockUsers.find((item) => item.id === doctorId);
  if (doctor) {
    doctor.unitIds = (doctor.unitIds || []).filter((id) => id !== unit.id);
  }

  // Os diagnósticos não são removidos: o histórico clínico deve ser preservado.
  return { ok: true, doctorId };
}

export async function getOwnerDashboardMock(ownerId) {
  const [unit, kpis, doctors] = await Promise.all([
    getMyUnitMock(ownerId),
    getUnitKpisMock(ownerId),
    listUnitDoctorsMock(ownerId),
  ]);

  return {
    unit,
    doctors,
    totalConsultations: kpis.totalConsultations,
    linkedDoctors: kpis.linkedDoctors,
  };
}
