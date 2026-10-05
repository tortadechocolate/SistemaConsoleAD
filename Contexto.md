# Contexto Técnico do Projeto: Mini Sistema de Gerenciamento de Consoles

Memória técnica atualizada do projeto. Este documento reflete o estado atual real da aplicação, decisões de arquitetura e histórico de evolução.

---

## 1. Objetivo Atual do Projeto
Desenvolver um mini sistema completo e desacoplado para cadastro e consulta de consoles de videogame contendo:
- **Backend REST em Node.js** com Express e MongoDB (Mongoose), preparado para deploy serverless na Vercel com caching de conexão.
- **Frontend independente em HTML5, CSS3 e JavaScript puro (Vanilla JS)**, consumindo a API via `fetch`, com layout responsivo dark gamer, cards, modais e feedback instantâneo.
- **Documentação técnica detalhada** (`Roadmap.md`, `Contexto.md`, `api.md`, `README.md`).
- **Suíte de testes automatizados** com cobertura de 100% dos cenários exigidos (18 testes com Jest e Supertest).

---

## 2. Arquitetura
A aplicação segue uma arquitetura desacoplada e em camadas:
- **Camada de Apresentação (Frontend)**:
  - Localizada em `frontend/`.
  - Construída estritamente em HTML5, CSS3 e JavaScript puro (sem React, Vue ou Angular).
  - Comunica-se com o backend exclusivamente via chamadas assíncronas HTTP (`fetch`).
  - Apresenta feedback visual com toasts, modais de confirmação, formatação de moeda em reais (`R$`) e datas em formato brasileiro (`DD/MM/AAAA`).
- **Camada de Rotas & Controladores (Backend API)**:
  - Localizada em `backend/src/`.
  - Roteamento Express modular em `src/routes/consoleRoutes.js`.
  - Controlador `src/controllers/consoleController.js` encapsula regras de negócio, formatação de dados e códigos de status HTTP apropriados (200, 201, 400, 404, 500).
  - Middleware centralizado de tratamento de erros em `src/middlewares/errorHandler.js`.
- **Camada de Modelo & Dados**:
  - `src/models/Console.js`: Mongoose Schema com validações rigorosas de presença, tipo, valores mínimos e regex para URL de imagens. Timestamps automáticos (`createdAt` e `updatedAt`).
- **Camada Serverless (Vercel)**:
  - `backend/api/index.js` exporta o aplicativo Express para o runtime `@vercel/node`.
  - `backend/vercel.json` gerencia rewrites e direcionamento de rotas.
  - `src/config/db.js` utiliza padrão singleton com `global.mongoose = { conn, promise }` para cachear conexões entre execuções de funções serverless, prevenindo gargalos e saturação no MongoDB Atlas.

---

## 3. Estrutura de Pastas Implementada
```
mini-sistema-consoles/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # Conexão MongoDB com singleton cache
│   │   ├── controllers/
│   │   │   └── consoleController.js # Lógica de negócio e CRUD
│   │   ├── models/
│   │   │   └── Console.js          # Schema Mongoose com validações
│   │   ├── routes/
│   │   │   └── consoleRoutes.js    # Rotas (/api/consoles e /api/health)
│   │   ├── middlewares/
│   │   │   └── errorHandler.js     # Tratamento centralizado de erros
│   │   └── app.js                  # Setup do Express, CORS e rotas
│   ├── api/
│   │   └── index.js                # Serverless function entrypoint para Vercel
│   ├── tests/
│   │   └── console.test.js         # 18 testes automatizados Jest + Supertest
│   ├── package.json                # Scripts e dependências
│   ├── vercel.json                 # Roteamento Vercel
│   └── .env.example                # Modelo de variáveis de ambiente
├── frontend/
│   ├── index.html                  # Interface gráfica semântica
│   ├── css/
│   │   └── style.css               # Design dark gamer glassmorphism
│   └── js/
│       └── app.js                  # Lógica Vanilla JS e consumo fetch
├── Roadmap.md                      # Acompanhamento das etapas do projeto
├── Contexto.md                     # Memória técnica atualizada
├── api.md                          # Documentação detalhada dos endpoints com cURL
├── .gitignore                      # Proteção de credenciais e dependências
└── README.md                       # Manual completo de instalação e uso
```

---

## 4. Tecnologias Utilizadas
- **Runtime**: Node.js (v24.11.1)
- **Framework Web**: Express.js (^4.21.2)
- **Banco de Dados**: MongoDB via Mongoose ODM (^8.9.5)
- **CORS & Variáveis de Ambiente**: cors (^2.8.5), dotenv (^16.4.7)
- **Testes Automatizados**: Jest (^29.7.0), Supertest (^7.0.0), mongodb-memory-server (^10.1.3), cross-env (^7.0.3)
- **Hospedagem & Deploy**: Vercel Serverless
- **Frontend**: HTML5 Semântico, CSS3 Moderno (Glassmorphism, Flexbox, CSS Grid), JavaScript ES6+ (Fetch API, DOM Events)

---

## 5. Funcionalidades Implementadas
- [x] API REST com CRUD completo de consoles (`GET`, `POST`, `PUT`, `DELETE`).
- [x] Endpoint de Health Check (`GET /api/health`).
- [x] Padrão consistente de respostas JSON (`success: true/false`, dados e erros detalhados).
- [x] Códigos HTTP apropriados para cada situação (200, 201, 400, 404, 500).
- [x] Cache de conexão Mongoose para Vercel Serverless Functions.
- [x] Validação rigorosa no schema e no controlador de dados (empresa, modelo, preço >= 0, URL de foto, data válida).
- [x] Frontend Vanilla moderno com tema dark gamer responsivo.
- [x] Listagem em cards com imagem de tamanho consistente, preço formatado em Real (`R$`) e data brasileira.
- [x] Estados da interface: carregando (spinner), vazio (ilustração gamer e botão de ação) e erro de conexão (banner com botão de retry).
- [x] Formulário modal para cadastro e edição com pré-visualização em tempo real da foto.
- [x] Modal de confirmação segura antes da exclusão de qualquer registro.
- [x] Notificações flutuantes (toasts) para feedback imediato de sucesso e erro.
- [x] Documentação técnica completa em `api.md`, `README.md`, `Roadmap.md` e `Contexto.md`.
- [x] Suíte de testes automatizados com 18 cenários executados e aprovados.

---

## 6. Endpoints Existentes e Validados
| Método | Endpoint | Descrição | Códigos HTTP | Status |
|---|---|---|---|---|
| `GET` | `/api/health` | Health check da API e status do banco | `200` | ✅ Validado |
| `GET` | `/api/consoles` | Lista todos os consoles cadastrados | `200` | ✅ Validado |
| `GET` | `/api/consoles/:id` | Busca detalhada de console por ID | `200`, `400`, `404` | ✅ Validado |
| `POST` | `/api/consoles` | Cadastra novo console no catálogo | `201`, `400` | ✅ Validado |
| `PUT` | `/api/consoles/:id` | Atualiza dados de console existente | `200`, `400`, `404` | ✅ Validado |
| `DELETE` | `/api/consoles/:id` | Remove console pelo ID | `200`, `400`, `404` | ✅ Validado |

---

## 7. Modelo do Banco de Dados (`Console`)
- `_id`: ObjectId gerado pelo MongoDB
- `empresa`: String (obrigatório, trim, min: 2, max: 100)
- `modelo`: String (obrigatório, trim, min: 1, max: 100)
- `preco`: Number (obrigatório, min: 0)
- `foto`: String (obrigatório, validado por regex de URL)
- `dataLancamento`: Date (obrigatório, data válida)
- `createdAt` e `updatedAt`: Gerenciados automaticamente por `timestamps: true`

---

## 8. Configurações Importantes
- **Variáveis de Ambiente**:
  - `PORT`: 3000
  - `MONGODB_URI`: String de conexão MongoDB (suporta Atlas e local)
  - `NODE_ENV`: `development` | `production` | `test`
  - `CORS_ORIGIN`: `*` (ou domínio específico do frontend)
- **Segurança**:
  - Credenciais nunca inclusas no código ou git.
  - `.gitignore` configurado na raiz cobrindo `.env`, `node_modules`, `coverage`, etc.
  - Sanitização de strings e validações manuais antes de operações no banco.

---

## 9. Decisões Técnicas
1. **Cache de Conexão Mongoose em Serverless**:
   Implementado em `src/config/db.js` com singleton em `global.mongoose`. Em cold starts ou invocações repetidas na Vercel, o Mongoose reutiliza a conexão aberta, prevenindo estouro de conexões no MongoDB Atlas.
2. **Uso de `mongodb-memory-server` nos Testes**:
   Permite que a suíte de testes de integração execute de forma totalmente autônoma, isolada e sem necessidade de conexão externa de internet ou serviço local `mongod`.
3. **Vanilla JS no Frontend**:
   Desenvolvido estritamente sem bibliotecas ou frameworks pesados (React, Vue, Angular, jQuery), utilizando as APIs nativas modernas do JavaScript (`fetch`, `Intl.NumberFormat`, `DOM manipulation`), garantindo leveza e velocidade de carregamento instantânea.

---

## 10. Problemas Encontrados e Soluções Aplicadas
- **Problema 1**: Bloqueio de script `npm.ps1` no PowerShell do Windows (`PSSecurityException`).
  - **Solução**: Uso exclusivo de `npm.cmd` em todos os scripts e comandos do terminal.
- **Problema 2**: Ausência de serviço local do MongoDB no sistema host Windows.
  - **Solução**: Configuração de `mongodb-memory-server` para a suíte de testes de integração, garantindo que 18 testes automatizados passem com 100% de sucesso sem depender de daemon local.
- **Problema 3**: Risco de "connection exhaustion" em deploys serverless na Vercel.
  - **Solução**: Conexão Mongoose com cache global singleton e opções de timeout e buffer configuradas.
- **Problema 4**: Falha na inicialização do Playwright no subagente do navegador (`open_browser_url`) decorrente de 404 na CDN do driver Playwright (`playwright-1.57.0-win32_x64.zip`).
  - **Solução/Procedimento**: Registrado conforme as regras do projeto. O frontend utiliza HTML/CSS/JS puros e pode ser aberto diretamente no navegador do sistema operacional (`frontend/index.html`) ou via servidor estático.

---

## 11. Resultado dos Testes Automatizados
- **Total de Suítes**: 1 executada com sucesso (`tests/console.test.js`)
- **Total de Testes**: 18 executados e aprovados
- **Tempo de Execução**: ~17.3s
- **Status**: 100% APROVADO

---

## 12. Próximos Passos
1. Iniciar o servidor local ou validar visualmente no navegador o frontend consumindo os endpoints.
2. Realizar a revisão final e entrega do projeto.
