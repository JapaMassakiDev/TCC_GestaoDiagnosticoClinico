import { mockDiagnoses, mockTimelines, mockUnits, mockUsers } from "../mock/database";
import { MOCK_MODE, apiFetch } from "./api";
import { onlyDigits } from "../utils/masks";

export async function findPatientByCpf(cpf) {
  if (!MOCK_MODE) return apiFetch(`/patients/by-cpf/${onlyDigits(cpf)}`);
  return mockUsers.find((u) => u.role === "paciente" && u.cpf === onlyDigits(cpf)) || null;
}

export async function searchPatients(query = "") {
  if (!MOCK_MODE) return apiFetch(`/patients?q=${encodeURIComponent(query)}`);
  const text = String(query).trim().toLowerCase();
  const digits = onlyDigits(query);
  if (!text) return [];
  return mockUsers
    .filter((u) => u.role === "paciente")
    .filter((u) => {
      if (!text) return true;
      return u.name.toLowerCase().includes(text) || (digits && u.cpf.includes(digits));
    })
    .slice(0, 8);
}

export async function listDiagnoses(user) {
  if (!MOCK_MODE) return apiFetch("/diagnoses");
  let rows;
  if (user.role === "paciente") {
    rows = mockDiagnoses.filter((d) => d.patientId === user.id);
  } else {
    const followedPatientIds = new Set(mockDiagnoses.filter((d) => d.doctorId === user.id).map((d) => d.patientId));
    rows = mockDiagnoses.filter((d) => followedPatientIds.has(d.patientId));
  }
  return rows.map(enrichDiagnosis).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function listPatientDiagnoses(patientId) {
  if (!MOCK_MODE) return apiFetch(`/diagnoses?patientId=${patientId}`);
  return mockDiagnoses
    .filter((d) => d.patientId === patientId)
    .map(enrichDiagnosis)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function enrichDiagnosis(d) {
  const patient = mockUsers.find((u) => u.id === d.patientId);
  const doctor = mockUsers.find((u) => u.id === d.doctorId);
  const unit = mockUnits.find((u) => u.id === d.unitId);
  const timeline = mockTimelines.find((t) => t.id === d.timelineId);
  return {
    ...d,
    patientName: patient?.name || "-",
    patientCpf: patient?.cpf || "",
    patientSex: patient?.sex || "-",
    patientBirthDate: patient?.birthDate || "",
    doctorName: doctor?.name || "-",
    doctorCrm: doctor?.crm || "-",
    unitName: unit?.name || "-",
    unitCep: unit?.cep || "",
    unitAddress: unit?.address || "-",
    unitNumber: unit?.number || "",
    unitPhone: unit?.phone || "-",
    unitLogoUri: unit?.logoUri || null,
    timelineName: timeline?.name || "Sem linha do tempo",
  };
}

export async function createDiagnosis(payload) {
  if (!MOCK_MODE) return apiFetch("/diagnoses", { method: "POST", body: JSON.stringify(payload) });
  const diagnosis = { id: `diag-${Date.now()}`, ...payload, createdAt: new Date().toISOString() };
  mockDiagnoses.push(diagnosis);
  return enrichDiagnosis(diagnosis);
}

export async function listTimelines(patientId) {
  if (!MOCK_MODE) return apiFetch(`/timelines?patientId=${patientId}`);
  return mockTimelines
    .filter((t) => t.patientId === patientId)
    .map((t) => ({
      ...t,
      diagnoses: mockDiagnoses
        .filter((d) => d.timelineId === t.id)
        .map(enrichDiagnosis)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    }));
}

export async function createTimeline({ patientId, doctorId, name, diagnosisIds = [] }) {
  if (!MOCK_MODE) {
    return apiFetch("/timelines", {
      method: "POST",
      body: JSON.stringify({ patientId, doctorId, name, diagnosisIds }),
    });
  }

  const timeline = {
    id: `timeline-${Date.now()}`,
    patientId,
    doctorId,
    name,
    createdAt: new Date().toISOString(),
  };

  mockTimelines.push(timeline);
  diagnosisIds.forEach((diagnosisId) => {
    const diagnosis = mockDiagnoses.find((d) => d.id === diagnosisId && d.patientId === patientId);
    if (diagnosis) diagnosis.timelineId = timeline.id;
  });
  return timeline;
}

export async function assignDiagnosesToTimeline({ timelineId, patientId, diagnosisIds = [] }) {
  if (!MOCK_MODE) {
    return apiFetch(`/timelines/${timelineId}/diagnoses`, {
      method: "PUT",
      body: JSON.stringify({ patientId, diagnosisIds }),
    });
  }

  diagnosisIds.forEach((diagnosisId) => {
    const diagnosis = mockDiagnoses.find((d) => d.id === diagnosisId && d.patientId === patientId);
    if (diagnosis) diagnosis.timelineId = timelineId;
  });
  return listTimelines(patientId);
}

export const getDoctorUnits = (doctorId) => mockUnits.filter((u) => u.doctorIds.includes(doctorId));
