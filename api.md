# Documentação Oficial da API: ConsoleVault REST API

Esta documentação descreve todos os endpoints, contratos de dados, códigos de status HTTP e exemplos práticos com `curl` para a API de Gerenciamento de Consoles.

---

## 1. Visão Geral

- **URL Base Local**: `http://localhost:3000/api`
- **URL Base Produção**: `https://<seu-projeto>.vercel.app/api`
- **Formato das Requisições e Respostas**: `application/json`
- **Autenticação**: Atualmente pública (preparada para inclusão futura de Bearer Token JWT)
- **CORS**: Habilitado para consumo por clientes web desacoplados.

---

## 2. Padrão de Respostas HTTP

### Sucesso
Respostas bem-sucedidas retornam a propriedade `success: true` acompanhada dos dados correspondentes:
```json
{
  "success": true,
  "data": { ... }
}
```

### Erro
Respostas de erro retornam `success: false` e mensagem descritiva:
```json
{
  "success": false,
  "error": "Descrição clara do erro",
  "details": ["Detalhe opcional 1", "Detalhe opcional 2"]
}
```

### Códigos de Status HTTP Utilizados
| Código | Significado | Quando é retornado |
|---|---|---|
| `200 OK` | Sucesso | Consulta, listagem, atualização ou exclusão realizada com êxito |
| `201 Created` | Criado | Novo console cadastrado com sucesso |
| `400 Bad Request` | Requisição Inválida | Campos obrigatórios ausentes, tipos incorretos ou ID em formato inválido |
| `404 Not Found` | Não Encontrado | Console não encontrado com o ID informado ou rota inexistente |
| `500 Internal Server Error` | Erro Interno | Falha inesperada do servidor ou banco de dados |

---

## 3. Endpoints Disponíveis

### 3.1. Health Check
Verifica se a API está online e se a conexão com o banco de dados MongoDB está ativa.

- **Método**: `GET`
- **Endpoint**: `/api/health`
- **Exemplo com cURL**:
  ```bash
  curl http://localhost:3000/api/health
  ```
- **Resposta de Exemplo (200 OK)**:
  ```json
  {
    "success": true,
    "status": "ok",
    "uptime": 45.12,
    "timestamp": "2026-10-05T11:20:00.000Z",
    "database": "connected"
  }
  ```

---

### 3.2. Listar Consoles
Retorna todos os consoles cadastrados, ordenados cronologicamente por data de criação decrescente.

- **Método**: `GET`
- **Endpoint**: `/api/consoles`
- **Exemplo com cURL**:
  ```bash
  curl http://localhost:3000/api/consoles
  ```
- **Resposta de Exemplo (200 OK)**:
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "_id": "670183b27b9c9f28d8a11b01",
        "empresa": "Sony",
        "modelo": "PlayStation 5",
        "preco": 3999.9,
        "foto": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db",
        "dataLancamento": "2020-11-12T00:00:00.000Z",
        "createdAt": "2026-10-05T11:00:00.000Z",
        "updatedAt": "2026-10-05T11:00:00.000Z"
      },
      {
        "_id": "670183b27b9c9f28d8a11b02",
        "empresa": "Microsoft",
        "modelo": "Xbox Series X",
        "preco": 4349.0,
        "foto": "https://images.unsplash.com/photo-1621259182978-fbf93132d53d",
        "dataLancamento": "2020-11-10T00:00:00.000Z",
        "createdAt": "2026-10-05T10:30:00.000Z",
        "updatedAt": "2026-10-05T10:30:00.000Z"
      }
    ]
  }
  ```

---

### 3.3. Buscar Console por ID
Retorna os dados de um console específico.

- **Método**: `GET`
- **Endpoint**: `/api/consoles/:id`
- **Parâmetros de Rota**:
  - `id` (String Hex de 24 caracteres do MongoDB)
- **Exemplo com cURL**:
  ```bash
  curl http://localhost:3000/api/consoles/670183b27b9c9f28d8a11b01
  ```
- **Resposta de Exemplo (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "670183b27b9c9f28d8a11b01",
      "empresa": "Sony",
      "modelo": "PlayStation 5",
      "preco": 3999.9,
      "foto": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db",
      "dataLancamento": "2020-11-12T00:00:00.000Z",
      "createdAt": "2026-10-05T11:00:00.000Z",
      "updatedAt": "2026-10-05T11:00:00.000Z"
    }
  }
  ```
- **Resposta de Erro (404 Not Found)**:
  ```json
  {
    "success": false,
    "error": "Console não encontrado com o ID informado."
  }
  ```
- **Resposta de Erro (400 Bad Request)**:
  ```json
  {
    "success": false,
    "error": "O identificador fornecido possui formato inválido."
  }
  ```

---

### 3.4. Cadastrar Console
Cria um novo registro de console no catálogo.

- **Método**: `POST`
- **Endpoint**: `/api/consoles`
- **Headers**: `Content-Type: application/json`
- **Corpo da Requisição (Body)**:
  ```json
  {
    "empresa": "Nintendo",
    "modelo": "Nintendo Switch OLED",
    "preco": 2199.90,
    "foto": "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e",
    "dataLancamento": "2021-10-08"
  }
  ```
- **Exemplo com cURL**:
  ```bash
  curl -X POST http://localhost:3000/api/consoles \
    -H "Content-Type: application/json" \
    -d '{
      "empresa": "Nintendo",
      "modelo": "Nintendo Switch OLED",
      "preco": 2199.90,
      "foto": "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e",
      "dataLancamento": "2021-10-08"
    }'
  ```
- **Resposta de Exemplo (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Console cadastrado com sucesso.",
    "data": {
      "_id": "670183b27b9c9f28d8a11b03",
      "empresa": "Nintendo",
      "modelo": "Nintendo Switch OLED",
      "preco": 2199.9,
      "foto": "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e",
      "dataLancamento": "2021-10-08T00:00:00.000Z",
      "createdAt": "2026-10-05T11:22:00.000Z",
      "updatedAt": "2026-10-05T11:22:00.000Z"
    }
  }
  ```
- **Resposta de Erro por Validação (400 Bad Request)**:
  ```json
  {
    "success": false,
    "error": "Dados de entrada inválidos.",
    "details": [
      "O campo empresa é obrigatório.",
      "O campo preco deve ser um valor numérico maior ou igual a zero."
    ]
  }
  ```

---

### 3.5. Atualizar Console
Atualiza os dados de um console já cadastrado.

- **Método**: `PUT`
- **Endpoint**: `/api/consoles/:id`
- **Headers**: `Content-Type: application/json`
- **Corpo da Requisição (Body)**:
  ```json
  {
    "preco": 1999.00,
    "modelo": "Nintendo Switch OLED Edição Mario"
  }
  ```
- **Exemplo com cURL**:
  ```bash
  curl -X PUT http://localhost:3000/api/consoles/670183b27b9c9f28d8a11b03 \
    -H "Content-Type: application/json" \
    -d '{
      "preco": 1999.00,
      "modelo": "Nintendo Switch OLED Edição Mario"
    }'
  ```
- **Resposta de Exemplo (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Console atualizado com sucesso.",
    "data": {
      "_id": "670183b27b9c9f28d8a11b03",
      "empresa": "Nintendo",
      "modelo": "Nintendo Switch OLED Edição Mario",
      "preco": 1999.0,
      "foto": "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e",
      "dataLancamento": "2021-10-08T00:00:00.000Z",
      "createdAt": "2026-10-05T11:22:00.000Z",
      "updatedAt": "2026-10-05T11:25:00.000Z"
    }
  }
  ```

---

### 3.6. Excluir Console
Remove um console do catálogo pelo seu identificador.

- **Método**: `DELETE`
- **Endpoint**: `/api/consoles/:id`
- **Exemplo com cURL**:
  ```bash
  curl -X DELETE http://localhost:3000/api/consoles/670183b27b9c9f28d8a11b03
  ```
- **Resposta de Exemplo (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Console excluído com sucesso.",
    "data": {
      "_id": "670183b27b9c9f28d8a11b03",
      "empresa": "Nintendo",
      "modelo": "Nintendo Switch OLED Edição Mario"
    }
  }
  ```
- **Resposta de Erro (404 Not Found)**:
  ```json
  {
    "success": false,
    "error": "Console não encontrado com o ID informado."
  }
  ```
