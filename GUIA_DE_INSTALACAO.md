# Guia Completo de Instalação e Execução - Saúde App TCC

Este guia detalha o passo a passo para configurar o ambiente de desenvolvimento do zero, desde a inicialização do banco de dados distribuído (Apache Cassandra) via Docker até a execução do Backend e Frontend do projeto.

---

## 1. Pré-requisitos
Certifique-se de ter as seguintes ferramentas instaladas em sua máquina:
- **[Git](https://git-scm.com/)**: Para clonar o repositório.
- **[Node.js](https://nodejs.org/en/) (v16 ou superior)**: Ambiente de execução do backend e frontend.
- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**: Para rodar o container do Apache Cassandra facilmente, sem necessidade de configuração complexa na máquina hospedeira.

---

## 2. Subindo o Banco de Dados (Apache Cassandra via Docker)
O coração do nosso sistema é o Apache Cassandra. Como é um banco robusto, a forma mais fácil de rodá-lo localmente é via Docker.

1. Abra o seu terminal (Powershell, CMD ou Bash) e execute o comando abaixo para baixar a imagem oficial e iniciar o servidor na porta padrão `9042`:
   ```bash
   docker run --name cassandra-tcc -p 9042:9042 -d cassandra:latest
   ```

2. **Aguarde a inicialização**: O Cassandra demora cerca de 45 a 60 segundos para carregar na primeira vez. Para verificar se ele já está totalmente "em pé" e pronto para receber conexões, execute:
   ```bash
   docker exec -it cassandra-tcc nodetool status
   ```
   > **Sucesso:** Quando aparecer `UN` (Up / Normal) ao lado do IP local, significa que o nó do banco de dados está ativo e funcionando.

---

## 3. Clonando o Repositório
Com o banco rodando em segundo plano, baixe o código fonte do sistema:

```bash
git clone https://github.com/JapaMassakiDev/TCC_GestaoDiagnosticoClinico.git
cd TCC_GestaoDiagnosticoClinico
```

---

## 4. Configurando e Rodando o Backend (API)

Acesse o diretório do Backend onde está a lógica de negócios e as regras Multi-tenant:

```bash
cd backend
```

### 4.1. Instalação das Dependências
Instale todos os pacotes necessários:
```bash
npm install
```

### 4.2. Variáveis de Ambiente (.env)
A aplicação precisa saber como conectar ao banco e assinar os tokens JWT. Crie um arquivo chamado `.env` na pasta `backend/` (você pode copiar o `.env.example`) e cole o seguinte conteúdo:

```env
PORT=3000
CASSANDRA_CONTACT_POINTS=127.0.0.1
CASSANDRA_PORT=9042
CASSANDRA_KEYSPACE=saude_app
JWT_SECRET=super_secret_tcc_key_2026
```

### 4.3. Inicialização e Sincronização Automática
O projeto foi modernizado para sincronizar as tabelas do Cassandra de forma 100% automatizada. Para iniciar o servidor de desenvolvimento (que reinicia automaticamente ao salvar arquivos), rode:
```bash
npm run dev
```

Se quiser rodar em modo de produção (sem *hot-reload*), rode:
```bash
npm start
```
> **Mágica do Sync:** Antes do servidor subir de fato, você verá os logs do nosso script interno (`sync.js`) criando o Keyspace (`saude_app`) e verificando a integridade de cada uma das tabelas. Quando ler **"Todas as tabelas foram criadas/sincronizadas com sucesso!"** e **"Servidor rodando na porta 3000"**, a API estará operante.

### 4.4. Testando as Rotas (Postman / Insomnia)
Para facilitar a demonstração na banca de TCC, exportamos duas coleções completas na pasta do backend:
- `TCC_Postman_Collection.json`
- `TCC_Insomnia_Collection.json`

Basta importar o arquivo correspondente na sua ferramenta de preferência. Todas as rotas (Cadastro, Login, Emissão de Diagnósticos) já estão configuradas com corpos de teste prontos e integração com Variáveis de Ambiente Automáticas.

### 4.5. Rodando a Suíte de Testes (Opcional)
Toda a nossa regra de negócios é blindada por 41 testes automatizados em Jest. Eles não precisam do banco rodando para funcionar (são isolados via Mock de repositório). Para executá-los:
```bash
npm test
```
---

## 5. Configurando e Rodando o Frontend (Interface)

Abra uma **nova janela do terminal** (mantenha a API e o Cassandra rodando na janela anterior) e volte para a pasta raiz do projeto. Entre no frontend:

```bash
cd frontend
```

### 5.1. Instalação
```bash
npm install
```

### 5.2. Execução
O frontend utiliza `Vite` como empacotador veloz. Para iniciá-lo, rode:
```bash
npm run dev
```

O terminal exibirá uma URL (geralmente `http://localhost:5173/`). Acesse pelo navegador e a aplicação completa do seu TCC estará em funcionamento!

---

## Comandos Úteis (Docker)

Se você desligar o PC e quiser rodar o projeto no dia seguinte, o Cassandra estará desligado. Não use `docker run` de novo, pois você perderia os dados. Apenas reinicie o container existente:

- **Ligar o banco existente:**
  ```bash
  docker start cassandra-tcc
  ```
- **Desligar o banco:**
  ```bash
  docker stop cassandra-tcc
  ```
- **Resetar tudo (apagar o banco e dados):**
  ```bash
  docker rm -f cassandra-tcc
  ```
