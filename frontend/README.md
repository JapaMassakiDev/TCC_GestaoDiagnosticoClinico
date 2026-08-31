# MedGreen - Expo + React Native + NativeWind

Protótipo completo em JavaScript, sem TypeScript, com dados mockados e arquitetura pronta para receber backend.

## Funcionalidades

- Login por CPF e senha.
- Verificação de CPF antes do login.
- CPF não encontrado direciona automaticamente ao cadastro.
- Cadastro por perfil: paciente, médico e dono.
- Máscaras visuais de CPF, CNPJ e CRM.
- Dados enviados ao service sem pontuação.
- Diagnósticos para paciente e médico.
- Grupos de diagnósticos renomeáveis.
- Seleção de diagnósticos para gerar QR Code.
- Leitor de QR Code para médico.
- Criação de diagnóstico exclusiva do médico.
- Cabeçalho da unidade preenchido automaticamente.
- Gestão exclusiva do dono.
- Upload local de logo.
- Vincular/remover médico.
- KPIs mockados.
- Navegação por perfil.

## Como instalar

1. Entre na pasta:
   cd medgreen-expo

2. Instale:
   npm install

3. Se o Expo avisar incompatibilidade de versões, rode:
   npx expo install --fix

4. Inicie:
   npx expo start

Para abrir no navegador:
   pressione W no terminal

Para Android:
   pressione A ou use Expo Go, quando compatível com o SDK do projeto.

## Contas mockadas

Paciente
CPF: 123.456.789-01
Senha: 123456

Médico
CPF: 987.654.321-00
Senha: 123456

Dono
CPF: 111.222.333-44
Senha: 123456

CPF novo:
Digite qualquer CPF diferente dos três acima, mantendo 11 dígitos.

## Backend real

O ponto de troca está em:
src/services/api.js

Hoje:
MOCK_MODE = true

Depois:
MOCK_MODE = false
API_URL = "http://SEU_IP:3000/api"

Endpoints sugeridos:

POST /auth/login
GET /auth/check-cpf/:cpf
POST /auth/register

GET /diagnoses/groups
PATCH /diagnoses/groups/:id
POST /diagnoses

GET /clinic/me
PUT /clinic/me
POST /clinic/doctors
DELETE /clinic/doctors/:doctorId
GET /clinic/stats

## Observação de segurança sobre QR Code

Neste protótipo, o QR contém os diagnósticos diretamente apenas para demonstrar a funcionalidade.

Em produção NÃO é recomendável colocar dados clínicos diretamente no QR Code.

Uma arquitetura melhor:
1. paciente seleciona diagnósticos;
2. backend cria compartilhamento temporário;
3. backend devolve token aleatório de uso curto;
4. QR contém somente esse token;
5. médico escaneia;
6. backend autentica médico, valida validade/consentimento e retorna os diagnósticos;
7. acesso fica registrado em auditoria.

Isso reduz exposição de dados pessoais e clínicos.
