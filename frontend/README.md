# Saúde APP — Frontend Expo

Frontend em **React Native + Expo + somente JavaScript + NativeWind + Tailwind CSS**

# Atualizações

- `Correção do "sumiço" do formulário do diagnóstico` que está dentro do bloco do diagnóstico clínico da aba "criar"
- Implementação de `sistema de notificação` (para o dono cadastrar um médico será necessário a autorização do médico permitir para ser validado). Além de precisar de confirmação (anexar contrato) para efetivar o médico na unidade, exceto para aqueles que utilizam o usuário dono e o médico para se cadastrarem, entendendo-se como dono do próprio negócio
- Alguns `arquivos nomeados em português` para uma melhor compreensão
- `Correção do botão "adicionar médico"` localizado na aba "gestão"
- As páginas tem `sessão com duração de 4 horas` em caso de inatividade na tela do usuário (Em outras palavras, posso atualizar a página que permanece logado a tela)
- `Correção dos campos de data`, onde o usuário apenas selecionará a data e não digita-la
- `Implementação da tela de escolha` do usuário tiver mais de um papel (Exemplo. Um usuário possui o papel de médico e dono) localizado o arquivo "TelaSelecionarPapel.js"
- `Implementação da rota do CNPJ`, assim como CPF tem sua verificação, o CNPJ possui o mesmo

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
   ├─ navigation/         # Stack + Bottom Tabs
   ├─ screens/            # camada de apresentação por funcionalidade
   │  ├─ auth/
   │  ├─ diagnostico/
   │  ├─ criar/
   │  ├─ gestao/
   │  └─ perfil/
   ├─ services/           # acesso e adaptação da API; cliente central em api.js
   └─ utils/              # máscaras e formatadores
```

# Resumo

| Método | Endpoint | Finalidade | Backend |
|---|---|---|---|
| GET | `/auth/check-cpf/:cpf` | Verificar CPF e papéis existentes | Integrado parcialmente — não retorna `usuarioId` e `papeis` |
| POST | `/auth/login` | Login e lista de papéis | Integrado parcialmente — não retorna todos os papéis |
| POST | `/auth/esqueci-senha` | Recuperação de senha | Não integrado — rota inexistente |
| POST | `/auth/redefinir-senha` | Nova senha | Não integrado — rota inexistente |
| POST | `/usuarios` | Cadastro básico | Integrado parcialmente — não persiste os campos específicos dos papéis |
| PUT | `/usuarios/:usuarioId/papeis` | Acrescentar outro papel ao mesmo CPF | Não integrado — rota inexistente |
| POST | `/auth/selecionar-papel` | Validar CRM ou CNPJ após escolher o papel | Não integrado — rota inexistente |
| PUT | `/usuarios/:usuarioId` | Atualizar perfil | Não integrado — rota inexistente |
| GET | `/usuarios/cpf/:cpf` | Buscar cadastro por CPF | Integrado parcialmente — não confirma o papel de paciente e a rota é pública |
| GET | `/pacientes?busca=:termo` | Pesquisar pacientes | Não integrado — rota inexistente |
| POST | `/tenants` | Criar unidade | Integrado parcialmente — não persiste todos os campos da interface |
| GET | `/tenants/me` | Listar unidades do usuário | Integrado parcialmente — resposta não contém todos os dados usados pela interface |
| GET | `/diagnosticos` | Listar diagnósticos | Integrado — consome automaticamente todas as páginas por `pageState` |
| GET | `/pacientes/:pacienteId/diagnosticos` | Diagnósticos por paciente | Integrado |
| POST | `/diagnosticos` | Criar diagnóstico | Integrado parcialmente — campos adicionais não persistidos |
| PUT | `/diagnosticos/:id` | Editar diagnóstico | Não integrado — rota inexistente |
| PATCH | `/diagnosticos/:id/cancelar` | Cancelar diagnóstico | Existe no backend, mas não é usado pelo frontend |
| GET | `/linhas-tempo?pacienteId=:pacienteId` | Listar linhas do tempo | Não integrado — rota inexistente |
| POST | `/linhas-tempo` | Criar linha do tempo | Não integrado — rota inexistente |
| PUT | `/linhas-tempo/:linhaTempoId/diagnosticos` | Vincular diagnósticos | Não integrado — rota inexistente |
| GET | `/unidades/minha-unidade` | Consultar unidade do dono | Não integrado — rota inexistente |
| GET | `/unidades/minha-unidade/painel` | Carregar Gestão | Não integrado — rota inexistente |
| GET | `/unidades/minha-unidade/indicadores` | KPIs da unidade | Não integrado — rota inexistente |
| GET | `/unidades/minha-unidade/medicos` | Médicos vinculados | Não integrado — rota inexistente |
| GET | `/medicos/por-crm/:crm` | Buscar médico por CRM | Não integrado — rota inexistente |
| POST | `/unidades/minha-unidade/medicos` | Vincular médico | Não integrado — rota inexistente |
| POST | `/unidades/minha-unidade/autorizacoes` | Enviar contrato e solicitar autorização | Não integrado — rota inexistente |
| GET | `/autorizacoes/medico/pendentes` | Listar autorizações do médico | Não integrado — rota inexistente |
| PUT | `/autorizacoes/:id/confirmar` | Confirmar autorização e criar vínculo | Não integrado — rota inexistente |
| PUT | `/autorizacoes/:id/cancelar` | Recusar autorização | Não integrado — rota inexistente |
| DELETE | `/unidades/minha-unidade/medicos/:medicoId` | Desvincular médico | Não integrado — rota inexistente |
| GET | `/integrations/viacep/:cep` | Consultar CEP exato | Integrado |
| GET | `/integrations/cnpj/:cnpj` | Validar CNPJ | Integrado — usado nos três fluxos de unidade, sem preenchimento automático |
| GET | `/integrations/cid?query=:termo` | Pesquisar CID-11 | Integrado parcialmente — backend usa catálogo local, não OMS |
| GET | `/integrations/sngpc?query=:termo` | Pesquisar medicamentos | Integrado parcialmente — backend usa catálogo local, não SNGPC real |

---

## 1. Login/Cadastro
- **GET** `/auth/check-cpf/:cpf`

    > Objetivo: Verificar se um CPF já está cadastrado. <br>
    Parâmetro: cpf -\> somente números. <br>
    Resposta necessária para múltiplos papéis:
    >```json
    >{
    >  "exists": true,
    >  "usuarioId": "user-id",
    >  "papeis": ["paciente", "medico"]
    >}
    >```
    >O backend atual retorna somente `exists`; por isso, a diferenciação de papéis ainda não está integrada.

- **POST** `/auth/login`

    > Objetivo: Autenticar usuário por CPF e senha.
    >
    >*Body*
    >```json
    >{
    >   "cpf": "12345678901",
    >   "senha": "123456" 
    >}
    >```
    >*Resposta esperada*
    >```json
    >{
    >    "token": "JWT_AQUI",
    >    "user":
    >    {
    >        "id": "user-id",
    >       "papeis": ["paciente", "medico"],
    >        "name": "Nome",
    >        "cpf": "12345678901" 
    >    } 
    >}
    >```

- **PUT** `/usuarios/:usuarioId/papeis`

    > Objetivo: acrescentar um novo papel ao CPF já existente, preservando o mesmo usuário. O backend deve impedir a repetição do mesmo papel e validar a senha antes da alteração.
    >
    > O corpo contém `papel` e os campos específicos do novo perfil, como `crm`, `cnpj`, dados da unidade ou dados do paciente.

- **POST** `/auth/selecionar-papel`

    > Objetivo: concluir o login depois que CPF e senha já foram validados. Paciente acessa diretamente; médico envia `papel` e `crm`; unidade envia `papel` e `cnpj`.
    >
    > A resposta deve devolver o usuário no papel escolhido e um JWT definitivo ou manter válido o token gerado na primeira etapa.

### Sessão e navegação

- usuário, JWT e aba atual são salvos no armazenamento seguro da aplicação;
- atualizar ou reabrir dentro do prazo restaura a sessão e a tela atual;
- formulários não enviados não são restaurados;
- qualquer interação renova a última atividade;
- quatro horas sem interação removem a sessão e direcionam ao Login;
- voltar pelo navegador até o Login realiza logout;
- depois do logout, avançar pelo navegador não restaura a sessão;
- os campos de data utilizam seleção visual em formato wheel, sem entrada digitável: no aplicativo usam `@react-native-community/datetimepicker` e, na web, um wheel próprio.

### Correção do papel retornado no login

Quando o backend ou o ambiente de demonstração identifica um único papel, `role`, `papel`, `papeis` e `roles` permanecem sincronizados. Isso impede que um médico, como o CPF de teste `98765432100`, seja posteriormente sobrescrito como paciente. A correção não cria nem acrescenta um papel novo ao usuário.

- **POST** `/auth/esqueci-senha`

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

- **POST** `/auth/redefinir-senha`

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

- **POST** `/usuarios`

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
>    "sex": "Masculino | Feminino | Outro",
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
- **PUT** `/usuarios/:usuarioId`

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
>    "password": "senha",
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
- **GET** `/usuarios/cpf/:cpf`

    > Objetivo: Localizar um paciente pelo CPF.
    >
    > Parâmetro: cpf -\> somente números.
    >
    > Resposta: Objeto básico ou 404, conforme implementação do backend. A rota atual não confirma se o cadastro possui papel de paciente e não exige autenticação.

- **GET** `/pacientes?busca=TERMO`

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
- **GET** `/diagnosticos`

    > Objetivo: Listar diagnósticos acessíveis ao usuário autenticado.
    >
    >Comportamento atual do backend: lista diagnósticos da unidade para Médico ou Dono, exige `X-Tenant-ID` e devolve paginação por `pageState`. Pacientes consultam o próprio histórico pela rota específica abaixo.

- **GET** `/pacientes/:pacienteId/diagnosticos`

    > Objetivo: Listar os diagnósticos de um paciente específico.
    >
    >*Exemplo*
    >```json
    >GET /pacientes/patient-1/diagnosticos
    >```
    >A rota existe no backend e exige `X-Tenant-ID`. O frontend ainda não envia esse cabeçalho nessa chamada, portanto o fluxo não está corretamente integrado.

- **POST** `/diagnosticos`

    > Objetivo: Criar/finalizar um diagnóstico.
    >
    >*Body esperado contém os dados montados na tela de criação, incluindo*
    >```json
    >{
    >   "paciente_id": "patient-1",
    >   "medico_id": "doctor-1",
    >   "tenant_id": "unit-1",
    >   "linha_tempo_id": "timeline-1 ou null",
    >   "titulo": "Título do diagnóstico",
    >   "codigo_cid": "CA23.0",
    >   "titulo_cid": "Descrição CID",
    >   "descricao": "Descrição clínica",
    >   "medicamentos":
    >   [{
    >       "nome": "Medicamento",
    >       "dose": "10 mg",
    >       "frequencia": "1 vez ao dia",
    >       "duracao": "7 dias",
    >       "observacao": "Observação"
    >   }]
    >}
    >```
    >O backend atual utiliza `paciente_id`, `titulo`, `descricao` e `codigo_cid`. Os demais campos são mantidos pelo frontend, mas ainda precisam ser implementados no backend.

- **PUT** `/diagnosticos/:id`

    > Objetivo: atualizar um diagnóstico durante a oportunidade única de edição disponibilizada ao médico responsável nos primeiros 10 minutos após `created_at`.
    >
    > O frontend envia o mesmo corpo em português utilizado na criação. A rota ainda não existe no backend enviado e, por isso, permanece marcada como não integrada.
    >
    > Ao selecionar a edição, o diagnóstico é marcado localmente como já utilizado. Fechar ou recarregar a aplicação encerra o modo de edição e o botão não volta a aparecer. Enquanto a edição estiver aberta, não é possível criar outro diagnóstico nem sair do sistema.

- **PATCH** `/diagnosticos/:id/cancelar`

    > Objetivo: cancelar um diagnóstico no backend.
    >
    > Esta rota existe no backend enviado, mas não é utilizada pelo frontend porque o fluxo solicitado utiliza edição temporária em vez de cancelamento.

## 5. Linhas do tempo
- **GET** `/linhas-tempo?pacienteId=:pacienteId`

    > Objetivo: Listar as linhas do tempo de um paciente com seus diagnósticos relacionados.

- **POST** `/linhas-tempo`

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

- **PUT** `/linhas-tempo/:linhaTempoId/diagnosticos`
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

- **POST** `/tenants`

    > Objetivo: cadastrar uma unidade para o usuário autenticado. Esta rota existe no backend e é usada durante o cadastro do perfil Dono.

- **GET** `/tenants/me`

    > Objetivo: listar as unidades às quais o usuário autenticado está vinculado. Esta rota existe no backend e é usada pelo bloco Documento clínico da aba Criar.

- **GET** `/unidades/minha-unidade`

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

- **GET** `/unidades/minha-unidade/painel`

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

- **GET** `/unidades/minha-unidade/indicadores`

    >Retorna somente os indicadores da unidade.
    >
    >```json
    >{
    >  "totalConsultations": 4,
    >  "linkedDoctors": 2
    >}
    >```

- **GET** `/unidades/minha-unidade/medicos`

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

- **GET** `/medicos/por-crm/:crm`

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

- **POST** `/unidades/minha-unidade/medicos`

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
    >- esta rota é usada diretamente, sem notificação e sem contrato, somente quando o CPF do médico encontrado for igual ao CPF do dono autenticado.

- **POST** `/unidades/minha-unidade/autorizacoes`

    >Cria uma solicitação de vínculo quando o CPF do médico for diferente do CPF do dono. O envio utiliza `multipart/form-data`.
    >
    >Campos enviados: `proprietario_id`, `medico_id`, `crm` e o arquivo `contrato`. O contrato é obrigatório e deve ser PDF ou imagem.
    >
    >A solicitação deve nascer com status `PENDENTE` e expirar 10 minutos depois do envio. Ao expirar, deve ser tratada como rejeitada.

- **GET** `/autorizacoes/medico/pendentes`

    >Lista as solicitações pendentes do médico autenticado. Cada item deve trazer identificador, unidade, dono, contrato e data de criação. Ao fazer login, o frontend abre automaticamente a primeira solicitação ainda válida; depois, as solicitações podem ser consultadas pelo botão de notificações do Perfil.

- **PUT** `/autorizacoes/:id/confirmar`

    >Confirma uma solicitação válida e cria o vínculo entre médico e unidade. Somente o médico destinatário pode confirmar, e a operação deve ser rejeitada após 10 minutos.

- **PUT** `/autorizacoes/:id/cancelar`

    >Recusa a solicitação. Depois do cancelamento, ela deixa de aparecer como pendente e o vínculo não é criado.

- **DELETE** `/unidades/minha-unidade/medicos/:medicoId`

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

- **GET** `/integrations/cid?query=:termo`

    > Objetivo: pesquisar códigos e descrições da CID-11. A rota está integrada ao backend enviado.

Implementação no frontend: `src/services/cidService.js`, pela função `buscarCids(termo)`.

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

O backend atual filtra um catálogo local de demonstração. Ao integrar a API real da OMS/CID-11, o formato de retorno deve ser preservado para evitar alterações nas telas.

---

## 8. Medicamentos / SNGPC — integração externa

- **GET** `/integrations/sngpc?query=:termo`

    > Objetivo: pesquisar medicamentos para a prescrição. A rota está integrada ao backend enviado.

Implementação no frontend: `src/services/catalogService.js`, pela função `buscarMedicamentos(termo)`. O backend atual filtra um catálogo local de demonstração; ainda não consulta o SNGPC/Anvisa.

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

- **GET** `/integrations/viacep/:cep`

    > Objetivo: consultar um CEP e preencher os campos de endereço. A rota está integrada ao backend enviado.

Implementação no frontend: `src/services/cepService.js`, pela função `buscarCep(cep)`.

Uso atual:

- consultar um CEP exato;
- preencher o endereço com o resultado do ViaCEP.

Limitações atuais:

- a pesquisa textual por endereço ainda não existe no backend;
- `buscarEnderecos` e `buscarCeps` retornam listas vazias;
- a validação atual confirma se o CEP existe, mas ainda não compara o endereço informado com o endereço retornado.

### Consulta de CNPJ

- **GET** `/integrations/cnpj/:cnpj`

    > Objetivo: validar se o CNPJ existe por meio da consulta do backend à BrasilAPI.

Implementação no frontend: `src/services/cnpjService.js`, pela função `consultarCnpj(cnpj)`.

Uso atual:

- validação no cadastro do perfil Dono/Unidade;
- validação na edição do perfil Dono/Unidade;
- validação depois da escolha do papel Unidade no login com múltiplos papéis;
- consulta após os 14 dígitos, com indicação visual de validação;
- bloqueio da continuidade quando o backend rejeita o CNPJ.

A resposta é utilizada somente para validar. Nenhum nome, endereço, telefone ou outro dado da empresa é preenchido automaticamente.

---

## 10. Limitações técnicas conhecidas

- Falhas de diversas consultas são convertidas em listas vazias ou `null`, dificultando distinguir ausência de dados de erro no backend.
- Recuperação de senha, redefinição de senha e atualização de perfil podem apresentar sucesso local mesmo sem persistência, pois as rotas correspondentes ainda não existem.
- A atualização local do perfil pode não preservar todos os campos de papel e unidade, e também não atualiza a sessão persistida de forma completa.
- Quando o backend não informa o papel, o frontend assume `paciente` e mantém compatibilidade específica para CPFs de demonstração. O reconhecimento geral de médicos e donos ainda depende da evolução do backend.
- A tela Gestão ainda retorna indicadores zerados e uma unidade local simulada.
- O frontend não consome `pageState`; assim, a listagem pode ficar limitada aos dez primeiros diagnósticos.
- A tela pode executar uma consulta de histórico para cada paciente, aumentando o número de requisições.
- Buscas de pacientes e medicamentos não cancelam requisições anteriores.
- O prazo de edição do diagnóstico e o prazo das autorizações dependem do relógio do frontend enquanto não houver validação no backend.
- O modal de edição precisa revalidar o prazo ao confirmar a entrada no modo de edição.
- Documentos clínicos muito longos podem ser cortados para tentar manter o PDF em uma página.
- Logos locais com URI `file://` podem não aparecer no HTML utilizado para gerar o PDF.
- O cliente não possui tempo limite para as requisições nem tratamento centralizado para respostas `401`.
- Não existem scripts de lint ou testes automatizados no frontend.
- O Expo Doctor identifica dependências que precisam ser alinhadas ao Expo SDK 54, incluindo versões diferentes de `expo-font` e peer dependencies não declaradas.

## 11. Observações de segurança do backend enviado

- `JWT_SECRET` deve ser obrigatório em produção; o backend possui uma chave padrão de desenvolvimento quando a variável não está configurada.
- `GET /usuarios/cpf/:cpf`, `GET /auth/check-cpf/:cpf` e as integrações públicas precisam de avaliação de privacidade e limitação de requisições.
- O CORS está liberado para qualquer origem.
- As regras de prazo, médico responsável e destinatário das autorizações devem ser validadas no backend, nunca somente no frontend.
- O backend futuro deve validar tipo, tamanho e conteúdo real dos contratos e imagens recebidos.