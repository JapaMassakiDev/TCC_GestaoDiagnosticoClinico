# Saúde APP — Frontend Expo

Frontend em **React Native + Expo + somente JavaScript + NativeWind + Tailwind CSS**

# Mockagem
- Para uma visualização do frontend, deixei mockados alguns usuários localizados embaixo da tela de Login (bloco verde) durante a execução `npx expo start --web` no CMD.
- No projeto, as mockagens estão na pasta (`src/mock/database.js`) e nas API's que serão integradas na pasta (`src/inegrations/`).

# Estrutura
```text
saude-app/
├─ App.js
├─ app.json
├─ babel.config.js
├─ metro.config.js
├─ tailwind.config.js
├─ global.css
├─ package.json
└─ src/
   ├─ components/         # componentes visuais reutilizáveis
   ├─ contexts/           # estado global de autenticação
   ├─ mock/               # banco mockado único
   ├─ navigation/         # Stack + Bottom Tabs
   ├─ screens/            # camada de apresentação por funcionalidade
   │  ├─ auth/
   │  ├─ diagnosis/
   │  ├─ create/
   │  ├─ management/
   │  └─ profile/
   ├─ services/           # regras de acesso ao mock / futura API
   └─ utils/              # máscaras e formatadores
```

# EndPoints
## 1. Login/Cadastro
- **GET** `/api/auth/check-cpf/:cpf`

    > Objetivo: Verificar se um CPF já está cadastrado. <br>
    Parâmetro: cpf -\> somente números. <br>
    Exemplo de resposta: { "exists": true }

- **POST** `/api/auth/login`

    > Objetivo: Autenticar usuário por CPF e senha.
    >
    >*Body*
    >```json
    >{
    >   "cpf": "12345678901",
    >   "password": "123456" 
    >}
    >```
    >*Resposta esperada*
    >```json
    >{
    >    "token": "JWT_AQUI",
    >    "user":
    >    {
    >        "id": "user-id",
    >       "role": "paciente",
    >        "name": "Nome",
    >        "cpf": "12345678901" 
    >    } 
    >}
    >```

- **POST** `/api/auth/forgot-password`

    >Objetivo: Solicitar recuperação de senha.
    >
    >*Body*
    >```json
    >{
    >    "email": "usuario@email.com" 
    >}
    >```
    >*Resposta esperada*
    >```json
    >{
    >    "ok": true,
    >    "userId": "user-id"
    >}
    >```

- **POST** `/api/auth/reset-password`

    > Objetivo: Cadastrar uma nova senha.
    >
    >*Body*
    >```json
    >{
    >    "userId": "user-id",
    >    "password": "nova-senha"
    >}
    >```
    >*Resposta esperada*
    >```json
    >{
    >    "ok": true
    >}
    >```

- **POST** `/api/auth/register`

    > Objetivo: Cadastrar Paciente, Médico ou Dono/Unidade.
    >
    > *Começa com*
    >```json
    >{
    >    "role": "paciente | medico | dono",
    >    "name": "Nome completo",
    >    "email": "email@teste.com",
    >    "cpf": "12345678901",
    >    "password": "senha"
    >}
    >```
    >*Mas dependendo da escolha do "role" será incluido também*
    >
    >Paciente:
    >```json
    >{
    >    "sex": "Masculino | Feminino | Outro"
    >    "phone": "14999999999",
    >    "email": "email@teste.com",
    >    "birthDate": "AAAA-MM-DD"
    >}
    >```
    >Médico:
    >```json
    >{
    >    "crm": "123456"
    >}
    >```  
    >Dono:
    >```json
    >{
    >    "cnpj": "12345678000190",
    >    "unitName": "Nome da unidade",
    >    "cep": "16400001",
    >    "address": "Rua..., Bairro - Cidade/UF",
    >    "number": "120",
    >    "phone": "14999999999",
    >    "logoUri": "URI/URL da logo"
    >}
    >```
    >*Resposta esperada*
    >```json
    >{
    >    "token": "JWT_AQUI",
    >    "user":
    >    {
    >        {...}
    >    } 
    >}
    >```    

## 2. Usuários/Perfil
- **PUT** `/api/users/:userId`

    > Objetivo: Atualizar o perfil do usuário autenticado.
    >
    >Pode receber, conforme o perfil:
    >```json
    >{
    >    "name": "Novo nome",
    >    "email": "email@teste.com",
    >    "cpf": "12345678901",
    >    "password": "nova senha opcional",
    >    "sex": "Feminino",
    >    "phone": "14999999999",
    >    "birthDate": "AAAA-MM-DD",
    >    "crm": "123456",
    >    "cnpj": "12345678000190",
    >    "unitName": "Nome da unidade",
    >    "password": "senha"
    >    "cep": "16400001",
    >    "address": "Endereço",
    >    "number": "120",
    >    "logoUri": "URI/URL"
    >}
    >```
    >*Resposta esperada*
    >```json
    >{
    >    "user":
    >    {
    >        [...]
    >    } 
    >}
    >```

## 3. Pacientes
- **GET** `/api/patients/by-cpf/:cpf`

    > Objetivo: Localizar um paciente pelo CPF.
    >
    > Parâmetro: cpf -\> somente números.
    >
    > Resposta: Objeto do paciente ou null/404, conforme implementação do backend.

- **GET** `/api/patients?q=TERMO`

    > Objetivo: Pesquisar pacientes pelo nome ou CPF.
    >
    >*Query*
    >```json
    >{
    >    q -> nome, parte do nome ou CPF.
    >}
    >```
    >*Resposta*
    >```json
    >{
    >   [{
    >       "id": "patient-1",
    >       "role": "paciente",
    >       "name": "Ana Martins",
    >       "cpf": "12345678901"
    >   }]
    >}
    >```

## 4. Diagnósticos
- **GET** `/api/diagnoses`

    > Objetivo: Listar diagnósticos acessíveis ao usuário autenticado.
    >
    >Comportamento esperado: 
    > - Paciente: próprios diagnósticos.
    > - Médico: diagnósticos dos pacientes acompanhados, respeitando as regras de acesso.

- **GET** `/api/diagnoses?patientId=:patientId`

    > Objetivo: Listar os diagnósticos de um paciente específico.
    >
    >*Exemplo*
    >```json
    >GET /api/diagnoses?patientId=patient-1
    >```

- **POST** `/api/diagnoses`

    > Objetivo: Criar/finalizar um diagnóstico.
    >
    >*Body esperado contém os dados montados na tela de criação, incluindo*
    >```json
    >{
    >   "patientId": "patient-1",
    >   "doctorId": "doctor-1",
    >   "unitId": "unit-1",
    >   "timelineId": "timeline-1 ou null",
    >   "title": "Título do diagnóstico",
    >   "cid":
    >   {
    >       "code": "CA23.0",
    >       "title": "Descrição CID"
    >   },
    >   "description": "Descrição clínica",
    >   "medications":
    >   [{
    >       "name": "Medicamento",
    >       "dose": "10 mg",
    >       "frequency": "1 vez ao dia",
    >       "duration": "7 dias",
    >       "observation": "Observação"
    >   }]
    >}
    >```
    >O formato exato do objeto CID/medicamentos deve ser alinhado ao payload final enviado pela tela quando o backend for implementado.

## 5. Linhas do tempo
- **GET** `/api/timelines?patientId=:patientId`

    > Objetivo: Listar as linhas do tempo de um paciente com seus diagnósticos relacionados.

- **POST** `/api/timelines`

    > Objetivo: Criar uma linha do tempo e, opcionalmente, vincular diagnósticos existentes.
    >
    >*Body*
    >```json
    >{
    >    "patientId": "patient-1",
    >    "doctorId": "doctor-1",
    >    "name": "Acompanhamento clínico",
    >    "diagnosisIds":
    >    [
    >       "diag-1",
    >       "diag-2"
    >    ]
    >}
    >```

- **PUT** `/api/timelines/:timelineId/diagnoses`
    > Objetivo: Vincular diagnósticos existentes a uma linha do tempo.
    >
    >*Body*
    >```json
    >{
    >    "patientId": "patient-1",
    >    "diagnosisIds":
    >    [
    >       "diag-1",
    >       "diag-2"
    >    ]
    >}
    >```

## 6. Gestão da Unidade

- **GET** `/api/units/my-unit`

    >Retorna a unidade pertencente ao usuário autenticado.
    >
    >```json
    >{
    >  "id": "unit-1",
    >  "ownerId": "owner-1",
    >  "name": "Clínica Vida Verde",
    >  "cep": "16400001",
    >  "address": "Rua das Acácias, Centro - Lins/SP",
    >  "number": "120",
    >  "phone": "1435331122",
    >  "cnpj": "12345678000190",
    >  "logoUri": null,
    >  "doctorIds": 
    >  [
    >       "doctor-1", "doctor-2"
    >  ]
    >}
    >```

- **GET** `/api/units/my-unit/dashboard`

    >Retorna de uma vez os dados necessários para renderizar a tela de gestão.
    >
    >```json
    >{
    >  "unit": {
    >    "id": "unit-1",
    >    "name": "Clínica Vida Verde",
    >    "phone": "1435331122"
    >  },
    >  "doctors": [
    >    {
    >      "id": "doctor-1",
    >      "name": "Dr. Rafael Lima",
    >      "crm": "123456",
    >      "diagnosisCount": 2
    >    }
    >  ],
    >  "totalConsultations": 4,
    >  "linkedDoctors": 2
    >}
    >```

- **GET** `/api/units/my-unit/kpis`

    >Retorna somente os indicadores da unidade.
    >
    >```json
    >{
    >  "totalConsultations": 4,
    >  "linkedDoctors": 2
    >}
    >```

- **GET** `/api/units/my-unit/doctors`

    >Lista os médicos atualmente vinculados à unidade.
    >
    >```json
    >[
    >  {
    >    "id": "doctor-1",
    >    "name": "Dr. Rafael Lima",
    >    "email": "rafael@teste.com",
    >    "cpf": "98765432100",
    >    "crm": "123456",
    >    "diagnosisCount": 2
    >  }
    >]
    >```

- **GET** `/api/doctors/by-crm/:crm`

    >Localiza um médico cadastrado pelo CRM antes do vínculo.
    >
    >**Parâmetro:** CRM somente com números.
    >
    >Resposta quando encontrado:
    >
    >```json
    >{
    >  "id": "doctor-1",
    >  "name": "Dr. Rafael Lima",
    >  "email": "rafael@teste.com",
    >  "cpf": "98765432100",
    >  "crm": "123456"
    >}
    >```

- **POST** `/api/units/my-unit/doctors`

    >Vincula um médico cadastrado à unidade do dono autenticado.
    >
    >```json
    >{
    >  "crm": "123456"
    >}
    >```
    >
    >Regras esperadas:
    >
    >- o CRM deve existir;
    >- o usuário encontrado deve possuir papel `medico`;
    >- não permitir vínculo duplicado;
    >- a unidade é determinada pelo dono autenticado no JWT.

- **DELETE** `/api/units/my-unit/doctors/:doctorId`

    >Desvincula o médico da unidade.
    >
    >Resposta sugerida:
    >
    >```json
    >{
    >  "ok": true,
    >  "doctorId": "doctor-1"
    >}
    >```

## 7. CID-11 — integração externa

Adapter:

```txt
src/integrations/CID-11/index.js
```

Contrato:

```js
searchCid11(query)
```

Retorno esperado:

```json
[
  {
    "id": "...",
    "code": "...",
    "title": "...",
    "description": "..."
  }
]
```

Ao instalar a API real da OMS/CID-11, preservar esse contrato evita alterações nas telas.

---

## 8. Medicamentos / SNGPC — integração externa

Adapter:

```txt
src/integrations/SNGPC/index.js
```

Contrato:

```js
searchSngpcMedications(query)
```

Retorno esperado:

```json
[
  {
    "id": "...",
    "name": "...",
    "activeIngredient": "...",
    "administrationRoute": "...",
    "registry": "..."
  }
]
```

---

## 9. ViaCEP — integração externa

Adapter:

```txt
src/integrations/ViaCEP/index.js
```

Contratos:

```js
searchCep(query)
searchAddress(query)
getCep(cep)
```

Uso atual:

- pesquisar CEP;
- preencher o endereço ao selecionar CEP;
- pesquisar endereço e obter CEP;
- validar coerência entre CEP e endereço.

---

# 10. Resumo

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/api/auth/check-cpf/:cpf` | Verificar CPF |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Recuperação de senha |
| POST | `/api/auth/reset-password` | Nova senha |
| POST | `/api/auth/register` | Cadastro |
| PUT | `/api/users/:userId` | Atualizar perfil |
| GET | `/api/patients/by-cpf/:cpf` | Buscar paciente por CPF |
| GET | `/api/patients?q=:query` | Pesquisar pacientes |
| GET | `/api/diagnoses` | Listar diagnósticos |
| GET | `/api/diagnoses?patientId=:patientId` | Diagnósticos por paciente |
| POST | `/api/diagnoses` | Criar diagnóstico |
| GET | `/api/timelines?patientId=:patientId` | Listar linhas do tempo |
| POST | `/api/timelines` | Criar linha do tempo |
| PUT | `/api/timelines/:timelineId/diagnoses` | Vincular diagnósticos |
| GET | `/api/units/my-unit` | Consultar unidade do dono |
| GET | `/api/units/my-unit/dashboard` | Carregar Gestão |
| GET | `/api/units/my-unit/kpis` | KPIs da unidade |
| GET | `/api/units/my-unit/doctors` | Médicos vinculados |
| GET | `/api/doctors/by-crm/:crm` | Buscar médico por CRM |
| POST | `/api/units/my-unit/doctors` | Vincular médico |
| DELETE | `/api/units/my-unit/doctors/:doctorId` | Desvincular médico |

---