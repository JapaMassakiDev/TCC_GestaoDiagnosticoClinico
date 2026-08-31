import { mockDiagnosisGroups } from "../mock/database";
import { MOCK_MODE, apiFetch } from "./api";

let groups = JSON.parse(JSON.stringify(mockDiagnosisGroups));

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export async function listDiagnosisGroups() {
  if (!MOCK_MODE) return apiFetch("/diagnoses/groups");
  await wait();
  return JSON.parse(JSON.stringify(groups));
}

export async function renameDiagnosisGroup(groupId, name) {
  if (!MOCK_MODE) {
    return apiFetch(`/diagnoses/groups/${groupId}`, {
      method: "PATCH",
      body: JSON.stringify({ name })
    });
  }

  await wait();
  groups = groups.map((group) =>
    group.id === groupId ? { ...group, name } : group
  );

  return groups.find((group) => group.id === groupId);
}

export async function createDiagnosis(payload) {
  if (!MOCK_MODE) {
    return apiFetch("/diagnoses", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  await wait();

  const diagnosis = {
    id: `diag-${Date.now()}`,
    ...payload,
    date: new Date().toLocaleDateString("pt-BR")
  };

  const targetGroup = groups.find((group) => group.id === payload.groupId);

  if (targetGroup) {
    targetGroup.diagnoses.unshift(diagnosis);
  } else {
    groups.unshift({
      id: `group-${Date.now()}`,
      name: payload.groupName || "Outros",
      color: "#DCEFE8",
      diagnoses: [diagnosis]
    });
  }

  return diagnosis;
}
