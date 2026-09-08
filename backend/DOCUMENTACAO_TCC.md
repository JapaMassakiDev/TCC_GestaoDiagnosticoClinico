# Saúde App - Sistema Multi-Tenant de Diagnósticos (Projeto TCC)

## 1. Apresentação do Projeto
O presente sistema é um protótipo acadêmico (Prova de Conceito) desenvolvido para Trabalho de Conclusão de Curso (TCC). Trata-se de uma aplicação backend baseada em Node.js para gestão e emissão de diagnósticos médicos e controle de acesso, sustentada inteiramente pelo banco de dados NoSQL Apache Cassandra.

## 2. Objetivo
Demonstrar a viabilidade e a eficiência da modelagem orientada a consultas utilizando um banco de dados NoSQL de altíssima escalabilidade. O objetivo central é implementar um modelo distribuído e multi-tenant num contexto de saúde, preservando o isolamento de dados sem o uso de relacionamentos tradicionais (JOINs).

## 3. Problema Solucionado
Em aplicações SaaS (Software as a Service) convencionais, utiliza-se a arquitetura relacional onde todos os clientes (clínicas) compartilham as mesmas tabelas, gerando gargalos severos de performance em grande escala e riscos de cruzamento e vazamento de dados de pacientes. O sistema soluciona isso propondo um modelo de dados fragmentado por nós do cluster, em que as restrições multi-tenant e de controle de papéis (RBAC) são modeladas diretamente na estrutura nativa de chaves de partição do Cassandra.

## 4. Tecnologias
- **Node.js**: Plataforma de execução (Backend).
- **Express**: Framework de roteamento e serviços HTTP.
- **Apache Cassandra**: Banco de Dados NoSQL (Wide-Column Store).
- **Express-Cassandra**: ODM (Object Document Mapper) para interagir com o cluster.
- **Bcrypt**: Ferramenta para hashing seguro de senhas.
- **JSON Web Token (JWT)**: Mecanismo Stateless para controle de sessões em ambientes distribuídos.
- **Jest & Supertest**: Frameworks para automação de testes unitários e de integração.

## 5. Arquitetura
A arquitetura de software fundamenta-se no padrão **MVC e Camadas (Controller / Service / Repository)**:
- **Controller**: Lida puramente com requisições e respostas HTTP. Nenhuma regra de negócio é tomada nesta camada.
- **Service**: Absorve de maneira coesa todas as regras, lógicas de autorização, regras de negócio e validações cruzadas do sistema.
- **Repository**: Gerencia interações de baixo nível com o Apache Cassandra (Queries em partições e execuções atômicas em `Batch`).

## 6. Estrutura de Diretórios
```text
/src
  /config         # Arquivos de configurações do ambiente e DB
  /controllers    # Tratamento e mapeamento das rotas HTTP
  /middleware     # Filtros interceptores (Autenticação JWT, Controle de RBAC e Multi-Tenant)
  /models         # Definições rigorosas dos Schemas Cassandra (Tabelas)
  /repositories   # Persistência de dados e execuções no Banco
  /routes         # Arquivos de mapeamento do Express
  /services       # O cérebro do sistema: regras de negócio e fluxos lógicos
/tests            # Suítes de testes automatizados abrangentes do projeto
```

## 7. Funcionamento do Apache Cassandra
O Apache Cassandra é desenhado para não possuir um ponto único de falha. Os dados são distribuídos num anel (Cluster) de múltiplos nós. O funcionamento se dá através da fragmentação e cópia dos dados pelo disco de múltiplos computadores, o que permite um volume de leituras e escritas sem qualquer bloqueio central.

## 8. Estratégia de Denormalização
No Cassandra, o tempo de CPU gasto para gravar dados em três tabelas separadas é virtualmente nulo e irrelevante perante o gasto para tentar fazer múltiplas varreduras de leitura cruzada no futuro. 
Por este motivo, os dados são **denormalizados propositalmente**. Sempre que uma transação ocorre (ex: emitir diagnóstico), as informações idênticas são gravadas simultaneamente em múltiplas tabelas, permitindo que cada perfil (paciente ou clínica) faça uma leitura perfeitamente direta, sem depender um do outro. 
Para garantir segurança e evitar perdas no meio do caminho, todas as rotinas utilizam `models.orm.doBatch()` para inserção atômica no banco.

## 9. Descrição das Tabelas Base
* **`usuarios`**: Base de perfis absolutos de identidade.
* **`usuarios_por_cpf` / `usuarios_por_email`**: Tabelas focadas exclusivamente em responder com agilidade se as chaves existem, e direcionar ao ID do usuário.
* **`tenants`**: Registro das clínicas matrizes.
* **`tenants_por_cnpj`**: Para localização ultrarrápida da clínica via CNPJ.
* **`tenant_usuarios_por_tenant` / `tenant_usuarios_por_usuario`**: Controle descentralizado de vínculos para que a clínica localize seus usuários, e para que o usuário localize suas clínicas.
* **`diagnosticos_por_tenant`**: Todos os laudos de uma clínica ordenados pelo tempo.
* **`diagnosticos_por_paciente`**: Todos os laudos de um paciente ordenados pelo tempo.
* **`auditoria_por_tenant`**: Rastreabilidade imutável de todas as ações das clínicas.

## 10. Partition Keys
A chave de partição diz ao Cassandra em *qual máquina ou nó* o dado deve ser fisicamente guardado. Se eu busco algo da "Clínica A" (`tenant_id`), todos os dados da Clínica A devem estar juntos para resgate imediato.

## 11. Clustering Keys
As chaves de agrupamento dizem como os dados devem ser organizados (ex: ordem decrescente) dentro de um servidor. Nosso modelo usa fortemente `created_at DESC` para que sistemas de prontuário apresentem instantaneamente do mais recente ao mais antigo.

## 12. Autenticação
A autenticação é garantida pelo cruzamento instantâneo via `usuarios_por_cpf`. Após a validação do _bcrypt_, é devolvido um JWT ultraleve ao cliente. Ele detém apenas o seu `sub` (ID Universal), provando a validade daquele corpo físico sem engordar o sistema com dados do passado que podem sofrer mutação.

## 13. RBAC (Role-Based Access Control)
Os papéis (ex: `DONO`, `MEDICO`, `PACIENTE`) não ficam salvos no JWT porque caso um médico seja demitido, o JWT dele ainda poderia durar algumas horas. O middleware `authTenantRbac.js` busca em tempo-real (de forma super performática O(1)) na tabela de Partição da Clínica se ele ainda possui o papel. Em caso negativo, a recusa 403 é instantânea. 

## 14. Multi-tenancy Isolado
Toda transação (criação e leitura) é obrigada a trafegar pelo filtro do cabeçalho `X-Tenant-ID`. Não há forma de acessar o sistema apenas como "um usuário global". Você obrigatoriamente deve provar sua participação em um Tenant (clínica). Nenhum ID viaja no Corpo da Requisição para burlar papéis, pois a arquitetura se alimenta diretamente dos interceptores via `req.tenant.id` validado e limpo.

## 15. Fluxo de Emissão de Diagnóstico
1. O Front-end bate na API com Token JWT e Headers;
2. `authenticate` recupera o `req.user.id`;
3. `authTenantRbac` varre o Cassandra conferindo se ele é MEDICO ativo no Tenant enviado por Header;
4. O *Service* verifica se o paciente também pertence ao mesmo Tenant;
5. O *Repository* aciona o Batch do Cassandra gravando nas tabelas *Diagnostico(Tenant)*, *Diagnostico(Paciente)* e gravando o Log em *Auditoria*;
6. Resposta 201 é enviada.

---

## Por que Cassandra?
* **Modelagem orientada às consultas (Query-Driven):** As tabelas são desenhadas primeiro com base no que a tela de Front-end ou API precisa ler e retornar de forma veloz.
* **Ausência de JOIN:** Tabelas não possuem chave estrangeira virtual em tempo de execução para juntar pedaços em CPU, tudo já nasce fisicamente pronto na tabela (Leitura Instantânea).
* **Denormalização:** A regra é duplicar as informações o máximo de vezes necessário para que a pesquisa de cada ator flua facilmente pelo design. O HD e espaço custam absurdamente mais barato que uso de CPU e Ram em bancos SQL tradicionais.
* **Partition Keys:** Um modelo rígido de como guiar a informação por caixas perfeitamente separadas e isoladas umas das outras. No projeto Multi-tenant, todo tenant tem seus dados encaixotados de forma física isoladamente.
* **Escalabilidade Horizontal:** Diferente do Relacional (onde crescer significa comprar um computador maior que tem limites). No Cassandra, dobrar a operação requer apenas a plugar novos computadores comuns na mesma rede sem parar o sistema. O modelo Multi-tenant que construímos jamais estouraria.

---

## Instalação
O projeto requer o Node.js v16+ instalado e uma instância do Apache Cassandra em andamento localmente ou em conteiner (ex. Docker: `docker run --name cassandra -p 9042:9042 -d cassandra`).

1. Clonar repositório.
2. Instalar pacotes de dependência:
```bash
npm install
```

## Configuração do .env
Crie um arquivo `.env` na raiz do sistema com o seguinte formato:
```env
PORT=3000
CASSANDRA_CONTACT_POINTS=127.0.0.1
CASSANDRA_PORT=9042
CASSANDRA_KEYSPACE=saude_app
JWT_SECRET=sua_chave_ultra_secreta_do_tcc
```

## Execução
Para iniciar o sistema em modo de falha rápida (fail-fast), basta rodar o comando:
```bash
npm start
```
O sistema falhará imediatamente e propositalmente caso o banco de dados não esteja disponível. O log emitirá `Express-Cassandra Models Loaded and Syncing` e indicará a porta `Servidor rodando`.

## Execução dos Testes
Não há necessidade de banco de dados para os testes pois todos os fluxos foram controlados por Mocks rígidos:
```bash
npm test
```
A suíte (Jest) processará dezenas de testes varrendo as regras de negócio de ponta a ponta (Controllers até Repositories).

## Endpoints da API

**Base URL**: `http://localhost:3000`

### Gerais
- `GET /health` -> Verifica o status geral do serviço

### Identidade
- `POST /usuarios` -> Cadastro do perfil global do usuário.
- `POST /auth/login` -> Emissão e validação de JWT via CPF e Senha.

### Clínica / Tenants
- `POST /tenants` *(Requer Auth)* -> Criação de um Tenant e elevação automática para papel de `DONO`.

### Diagnósticos e Laudos
*(Todas as rotas abaixo requerem Token JWT e o Header `X-Tenant-ID`)*

- `POST /diagnosticos` -> Emissão e gravação em Batch do laudo médico. Apenas *MEDICOS*.
- `GET /diagnosticos` -> Listagem temporal (Limit Pagination) de laudos da clínica. Apenas *DONO/MEDICO*.
- `GET /pacientes/:pacienteId/diagnosticos` -> Listagem do Prontuário de um paciente da clínica. *PACIENTE* limitado a ver os seus, e *MEDICOS* livres para consulta geral.
- `PATCH /diagnosticos/:id/cancelar` -> Soft-delete/atualização de Status lógico do laudo, persistido na Auditoria. Apenas *MEDICOS*.

---

## 🛑 Limitações do Projeto
**AVISO ACADÊMICO**: Este projeto foi construído para ser apresentado como uma "Prova de Conceito" para **Trabalho de Conclusão de Curso (TCC)** sobre Engenharia de Software Distribuída Multi-tenant. Ele provê isolamento robusto, proteção matemática das partições NoSQL e fortes barreiras de teste.

No entanto, **ele não é um Prontuário Eletrônico do Paciente (PEP) pronto para produção hospitalar**. Recursos fundamentais como criptografia ponta a ponta (Zero-Knowledge) para dados de Hipóteses de CID, compliance total com regulações governamentais rígidas (ex: HIPAA ou LGPD rigorosa) e validações com conselhos médicos digitais (CRM-Digital) não constam neste escopo, e exigiriam centenas de horas e módulos adicionais dedicados. Seu objetivo é apenas comprovar a integridade dos limites distribuídos.
