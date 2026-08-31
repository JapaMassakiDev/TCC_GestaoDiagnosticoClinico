import { mockClinic, mockStats, mockUsers } from "../mock/database";
import { MOCK_MODE, apiFetch } from "./api";

let clinic = JSON.parse(JSON.stringify(mockClinic));

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getClinic() {
  if (!MOCK_MODE) return apiFetch("/clinic/me");
  await wait();

  return {
    ...clinic,
    doctorObjects: clinic.doctors
      .map((id) => mockUsers.find((user) => user.id === id))
      .filter(Boolean)
  };
}

export async function updateClinic(payload) {
  if (!MOCK_MODE) {
    return apiFetch("/clinic/me", {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  }

  await wait();
  clinic = { ...clinic, ...payload };
  return clinic;
}

export async function addDoctorByCpf(cpf) {
  if (!MOCK_MODE) {
    return apiFetch("/clinic/doctors", {
      method: "POST",
      body: JSON.stringify({ cpf })
    });
  }

  await wait();

  const doctor = mockUsers.find(
    (u) => u.role === "medico" && u.cpf === String(cpf).replace(/\D/g, "")
  );

  if (!doctor) throw new Error("Médico não encontrado no mock.");

  if (!clinic.doctors.includes(doctor.id)) {
    clinic.doctors.push(doctor.id);
  }

  return doctor;
}

export async function removeDoctor(doctorId) {
  if (!MOCK_MODE) {
    return apiFetch(`/clinic/doctors/${doctorId}`, { method: "DELETE" });
  }

  await wait();
  clinic.doctors = clinic.doctors.filter((id) => id !== doctorId);
  return true;
}

export async function getClinicStats() {
  if (!MOCK_MODE) return apiFetch("/clinic/stats");
  await wait();
  return {
    ...mockStats,
    activeDoctors: clinic.doctors.length
  };
}
