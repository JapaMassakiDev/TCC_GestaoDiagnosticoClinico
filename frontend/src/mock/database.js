export const mockUsers = [
  {
    id: "patient-1",
    role: "paciente",
    name: "Ana Martins",
    email: "ana@teste.com",
    cpf: "12345678901",
    password: "123456"
  },
  {
    id: "doctor-1",
    role: "medico",
    name: "Dr. Rafael Lima",
    email: "rafael@teste.com",
    cpf: "98765432100",
    crm: "123456",
    password: "123456",
    ownerId: "owner-1"
  },
  {
    id: "owner-1",
    role: "dono",
    name: "Marcos Silva",
    email: "marcos@teste.com",
    cpf: "11122233344",
    cnpj: "12345678000190",
    password: "123456"
  }
];

export const mockClinic = {
  id: "clinic-1",
  ownerId: "owner-1",
  name: "Clínica Vida Verde",
  address: "Rua das Acácias, 120 - Centro - Lins/SP",
  phone: "(14) 3533-1122",
  logoUri: null,
  doctors: ["doctor-1"]
};

export const mockDiagnosisGroups = [
  {
    id: "group-1",
    name: "Neurologia",
    color: "#CDEEDB",
    diagnoses: [
      {
        id: "diag-1",
        title: "Acompanhamento de Cefaleia",
        description:
          "Paciente relata episódios de cefaleia recorrente. Avaliação clínica sem sinais de alarme no momento.",
        medicines: "Dipirona 500 mg se necessário, conforme orientação médica.",
        date: "25/08/2026",
        doctor: "Dr. Rafael Lima",
        clinic: "Clínica Vida Verde"
      },
      {
        id: "diag-2",
        title: "Avaliação Neurológica",
        description:
          "Exame clínico de acompanhamento. Mantida observação e retorno programado.",
        medicines: "Sem alteração medicamentosa.",
        date: "18/08/2026",
        doctor: "Dr. Rafael Lima",
        clinic: "Clínica Vida Verde"
      }
    ]
  },
  {
    id: "group-2",
    name: "Respiratório",
    color: "#DCEFE8",
    diagnoses: [
      {
        id: "diag-3",
        title: "Rinite Alérgica",
        description:
          "Quadro compatível com rinite alérgica sazonal, sem sinais de infecção bacteriana.",
        medicines: "Loratadina conforme prescrição.",
        date: "02/08/2026",
        doctor: "Dr. Rafael Lima",
        clinic: "Clínica Vida Verde"
      }
    ]
  }
];

export const mockStats = {
  totalAppointments: 48,
  thisMonth: 17,
  activeDoctors: 1
};
