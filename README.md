# ConsoleVault - Mini Sistema de Gerenciamento de Consoles

Um sistema web completo, moderno e desacoplado para cadastro, consulta, edição e exclusão de consoles de videogame. O projeto é composto por uma **API REST em Node.js com Express e MongoDB** (otimizada para execução local e serverless na **Vercel**), um **Frontend Vanilla independente (HTML5, CSS3, JavaScript puro)** com estética gamer moderna, e uma **suíte de testes automatizados**.

---

## 📑 Sumário

- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Requisitos Prévios](#-requisitos-prévios)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Configuração do Banco MongoDB](#-configuração-do-banco-mongodb)
- [Executando o Backend Localmente](#-executando-o-backend-localmente)
- [Executando o Frontend](#-executando-o-frontend)
- [Executando os Testes Automatizados](#-executando-os-testes-automatizados)
- [Deploy na Vercel](#-deploy-na-vercel)
- [Documentações Complementares](#-documentações-complementares)

---

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js**: Plataforma de execução JavaScript assíncrona.
- **Express**: Framework web minimalista para criação dos endpoints REST.
- **MongoDB & Mongoose**: Banco NoSQL orientado a documentos e modelagem com validações de esquema.
- **CORS & Dotenv**: Habilitação de requisições cross-origin e gestão segura de variáveis de ambiente.
- **Jest, Supertest & MongoMemoryServer**: Testes de integração automatizados em banco de dados isolado em memória.

### Frontend
- **HTML5 Semântico**: Estrutura acessível com header, formulários, modais e containers de estado.
- **CSS3 Moderno**: Tema dark gamer com glassmorphism, gradientes, sombras suaves, micro-interações e responsividade total.
- **Vanilla JavaScript (ES6+)**: Consumo assíncrono da API via `fetch`, manipulação do DOM sem frameworks, validações client-side, formatação de moeda brasileira (`R$`) e datas (`DD/MM/AAAA`).

---

## 📂 Estrutura do Projeto

```
mini-sistema-consoles/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # Conexão MongoDB com singleton cache para serverless
│   │   ├── controllers/
│   │   │   └── consoleController.js # Lógica de negócio, validações e respostas HTTP
│   │   ├── models/
│   │   │   └── Console.js          # Schema Mongoose com validações de dados e timestamps
│   │   ├── routes/
│   │   │   └── consoleRoutes.js    # Rotas da API (/api/consoles e /api/health)
│   │   ├── middlewares/
│   │   │   └── errorHandler.js     # Tratamento centralizado de erros e respostas JSON
│   │   └── app.js                  # Inicialização do Express, CORS e middlewares
│   ├── api/
│   │   └── index.js                # Handler para Vercel Serverless Functions
│   ├── tests/
│   │   └── console.test.js         # 18 testes automatizados cobrindo todos os fluxos
│   ├── package.json                # Scripts e dependências do projeto
│   ├── vercel.json                 # Roteamento e rewrites serverless da Vercel
│   ├── .env.example                # Modelo de variáveis de ambiente
│   └── .env                        # Arquivo local com credenciais (ignorado no git)
│
├── frontend/
│   ├── index.html                  # Interface gráfica do usuário
│   ├── css/
│   │   └── style.css               # Estilos, variáveis CSS e responsividade
│   └── js/
│       └── app.js                  # Consumo da API via Fetch, eventos e controle de estados
│
├── Roadmap.md                      # Acompanhamento do progresso e status de cada etapa
├── Contexto.md                     # Memória técnica, decisões de design e soluções aplicadas
├── api.md                          # Documentação detalhada dos endpoints com cURL
├── .gitignore                      # Proteção contra commit de credenciais e dependências
└── README.md                       # Manual do projeto
```

---

## ⚙️ Requisitos Prévios

- **Node.js** v18 ou superior instalado ([nodejs.org](https://nodejs.org/))
- **NPM** instalado
- Uma instância do **MongoDB** (local ou cluster gratuito no [MongoDB Atlas](https://www.mongodb.com/atlas))

---

## 🔧 Instalação e Configuração

1. Abra o terminal no diretório do projeto:
   ```bash
   cd mini-sistema-consoles/backend
   ```

2. Instale todas as dependências:
   ```bash
   npm.cmd install
   # ou no Linux/macOS:
   # npm install
   ```

3. Crie o arquivo `.env` a partir do modelo `.env.example`:
   ```bash
   cp .env.example .env
   # No Windows PowerShell:
   # Copy-Item .env.example .env
   ```

4. Preencha as variáveis de ambiente no `.env`:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://<usuario>:<senha>@cluster0.mongodb.net/consoles_db?retryWrites=true&w=majority
   CORS_ORIGIN=*
   ```

---

## 🍃 Configuração do Banco MongoDB

### Opção A: MongoDB Atlas (Recomendado para Nuvem e Vercel)
1. Crie uma conta gratuita em [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Crie um cluster gratuito (M0 Sandbox).
3. Em **Database Access**, crie um usuário com usuário e senha.
4. Em **Network Access**, adicione o IP `0.0.0.0/0` (permitir acesso de qualquer lugar, necessário para a Vercel).
5. Em **Database**, clique em **Connect** > **Drivers** > **Node.js** e copie a connection string.
6. Cole a connection string na variável `MONGODB_URI` no `.env`.

### Opção B: MongoDB Local
Caso tenha o MongoDB instalado em sua máquina local ou via Docker:
```bash
docker run -d -p 27017:27017 --name mongodb-local mongo:latest
```
E configure `MONGODB_URI=mongodb://localhost:27017/consoles_db`.

---

## 💻 Executando o Backend Localmente

Para iniciar a API em modo de desenvolvimento ou produção:
```bash
cd backend
npm.cmd start
```

O servidor iniciará em `http://localhost:3000`.
Você pode testar a conexão acessando o Health Check no navegador ou terminal:
```bash
curl http://localhost:3000/api/health
```

---

## 🖥️ Executando o Frontend

Por ser uma aplicação independente construída em HTML/CSS/JavaScript puro, você pode executá-la de qualquer uma das seguintes formas:

1. **Abrindo diretamente o arquivo**:
   Basta dar um duplo clique no arquivo `frontend/index.html` ou abri-lo no seu navegador favorito.
2. **Utilizando um servidor estático local** (ex: Live Server ou `npx serve`):
   ```bash
   npx.cmd serve frontend
   ```
   Acesse a URL indicada (ex: `http://localhost:5000`).

---

## 🧪 Executando os Testes Automatizados

A API conta com **18 testes automatizados** utilizando **Jest**, **Supertest** e **MongoDB Memory Server**. Os testes inicializam um banco em memória temporário e independente, sem sujar seu banco de produção e sem necessitar de internet:

```bash
cd backend
npm.cmd test
```

### Cenários Testados:
- ✅ **Health Check**: Validação de status 200, uptime e banco conectado.
- ✅ **Listagem de Consoles**: Retorno vazio e retorno populado.
- ✅ **Cadastro Válido**: Persistência no banco e resposta 201 Created.
- ✅ **Validações de Entrada**: Rejeição de campos ausentes, preços negativos e datas inválidas (400 Bad Request).
- ✅ **Busca por ID**: Sucesso (200), ID inexistente (404) e ID com formato incorreto (400).
- ✅ **Atualização de Console**: Atualização parcial e total (200), ID inexistente (404) e dados inválidos (400).
- ✅ **Exclusão de Console**: Remoção física do banco (200) e ID inexistente (404).
- ✅ **Tratamento de Rotas Inexistentes**: Resposta padronizada 404 em rotas não mapeadas.

---

## ☁️ Deploy na Vercel

A API foi projetada para execução serverless na plataforma Vercel.

1. Instale a Vercel CLI ou utilize o painel web da Vercel:
   ```bash
   npm.cmd i -g vercel
   ```
2. No diretório `backend`:
   ```bash
   cd backend
   vercel
   ```
3. No painel do projeto na Vercel (ou via CLI), configure as **Environment Variables**:
   - `MONGODB_URI`: String de conexão do seu MongoDB Atlas.
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: URL do seu frontend ou `*`.
4. A Vercel criará automaticamente uma Serverless Function mapeada a partir de `backend/api/index.js` e as regras de reescrita em `backend/vercel.json`.

---

## 📖 Documentações Complementares

Para detalhes minuciosos sobre o desenvolvimento e integração:
- 📌 **[Roadmap.md](Roadmap.md)**: Acompanhamento de todas as fases, checklist de tarefas e validações concluídas.
- 📌 **[Contexto.md](Contexto.md)**: Memória técnica, arquitetura detalhada, histórico de decisões e soluções aplicadas.
- 📌 **[api.md](api.md)**: Referência completa da API REST com parâmetros, exemplos em cURL e contratos JSON.
