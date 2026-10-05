const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Console = require('../src/models/Console');

let mongoServer;

beforeAll(async () => {
  // Inicializa o servidor MongoDB em memória para testes isolados e determinísticos
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;

  // Garante desconexão prévia se houver
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri);
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  // Limpa os dados entre cada caso de teste
  await Console.deleteMany({});
});

describe('=== Suíte de Testes da API de Consoles ===', () => {
  
  describe('GET /api/health', () => {
    it('deve retornar status 200 com informações de saúde e banco conectado', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('database', 'connected');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api/consoles', () => {
    it('deve retornar 200 e uma lista vazia quando não há consoles cadastrados', async () => {
      const response = await request(app).get('/api/consoles');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('deve retornar 200 e a lista com todos os consoles cadastrados', async () => {
      await Console.create({
        empresa: 'Sony',
        modelo: 'PlayStation 5',
        preco: 3999.9,
        foto: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db',
        dataLancamento: new Date('2020-11-12'),
      });
      await Console.create({
        empresa: 'Microsoft',
        modelo: 'Xbox Series X',
        preco: 4349.0,
        foto: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d',
        dataLancamento: new Date('2020-11-10'),
      });

      const response = await request(app).get('/api/consoles');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0]).toHaveProperty('empresa');
      expect(response.body.data[0]).toHaveProperty('modelo');
      expect(response.body.data[0]).toHaveProperty('preco');
      expect(response.body.data[0]).toHaveProperty('foto');
      expect(response.body.data[0]).toHaveProperty('dataLancamento');
    });
  });

  describe('POST /api/consoles', () => {
    it('deve cadastrar um novo console com sucesso (201)', async () => {
      const payload = {
        empresa: 'Nintendo',
        modelo: 'Switch OLED',
        preco: 2199.5,
        foto: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e',
        dataLancamento: '2021-10-08',
      };

      const response = await request(app)
        .post('/api/consoles')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.empresa).toBe(payload.empresa);
      expect(response.body.data.modelo).toBe(payload.modelo);
      expect(response.body.data.preco).toBe(payload.preco);
      expect(response.body.data.foto).toBe(payload.foto);

      // Confere persistência no banco
      const salvo = await Console.findById(response.body.data._id);
      expect(salvo).not.toBeNull();
      expect(salvo.modelo).toBe(payload.modelo);
    });

    it('deve retornar 400 ao tentar cadastrar sem campos obrigatórios', async () => {
      const response = await request(app)
        .post('/api/consoles')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.details).toContain('O campo empresa é obrigatório.');
      expect(response.body.details).toContain('O campo modelo é obrigatório.');
      expect(response.body.details).toContain('O campo preco deve ser um valor numérico maior ou igual a zero.');
      expect(response.body.details).toContain('O campo foto é obrigatório.');
      expect(response.body.details).toContain('O campo dataLancamento deve ser uma data válida.');
    });

    it('deve retornar 400 ao tentar cadastrar com preço negativo', async () => {
      const payload = {
        empresa: 'Sega',
        modelo: 'Dreamcast',
        preco: -150,
        foto: 'https://example.com/dreamcast.jpg',
        dataLancamento: '1998-11-27',
      };

      const response = await request(app)
        .post('/api/consoles')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toContain('O campo preco deve ser um valor numérico maior ou igual a zero.');
    });

    it('deve retornar 400 com data de lançamento inválida', async () => {
      const payload = {
        empresa: 'Sony',
        modelo: 'PlayStation 2',
        preco: 1200,
        foto: 'https://example.com/ps2.jpg',
        dataLancamento: 'data-invalida-xyz',
      };

      const response = await request(app)
        .post('/api/consoles')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/consoles/:id', () => {
    it('deve retornar 200 e os dados de um console existente por ID', async () => {
      const criado = await Console.create({
        empresa: 'Sony',
        modelo: 'PlayStation 4',
        preco: 1999.0,
        foto: 'https://images.unsplash.com/photo-1507457379470-08b800bebc67',
        dataLancamento: new Date('2013-11-15'),
      });

      const response = await request(app).get(`/api/consoles/${criado._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(criado._id.toString());
      expect(response.body.data.modelo).toBe('PlayStation 4');
    });

    it('deve retornar 404 quando o ID for válido mas inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/consoles/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('não encontrado');
    });

    it('deve retornar 400 quando o ID possuir formato inválido', async () => {
      const response = await request(app).get('/api/consoles/id-invalido-123');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('formato inválido');
    });
  });

  describe('PUT /api/consoles/:id', () => {
    it('deve atualizar um console existente com sucesso (200)', async () => {
      const criado = await Console.create({
        empresa: 'Microsoft',
        modelo: 'Xbox Series S',
        preco: 2200.0,
        foto: 'https://example.com/xbox-s.jpg',
        dataLancamento: new Date('2020-11-10'),
      });

      const payload = {
        preco: 2099.9,
        modelo: 'Xbox Series S 1TB Carbon',
      };

      const response = await request(app)
        .put(`/api/consoles/${criado._id}`)
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.preco).toBe(2099.9);
      expect(response.body.data.modelo).toBe('Xbox Series S 1TB Carbon');
      expect(response.body.data.empresa).toBe('Microsoft'); // Mantido
    });

    it('deve retornar 404 ao tentar atualizar console inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/consoles/${fakeId}`)
        .send({ preco: 1500 });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar 400 ao enviar ID inválido para atualização', async () => {
      const response = await request(app)
        .put('/api/consoles/abc-invalido')
        .send({ preco: 1500 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar 400 ao enviar dados inválidos na atualização', async () => {
      const criado = await Console.create({
        empresa: 'Nintendo',
        modelo: 'Game Boy',
        preco: 300,
        foto: 'https://example.com/gameboy.jpg',
        dataLancamento: new Date('1989-04-21'),
      });

      const response = await request(app)
        .put(`/api/consoles/${criado._id}`)
        .send({ preco: -50 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/consoles/:id', () => {
    it('deve excluir um console existente com sucesso (200)', async () => {
      const criado = await Console.create({
        empresa: 'Atari',
        modelo: 'Atari 2600',
        preco: 500,
        foto: 'https://example.com/atari.jpg',
        dataLancamento: new Date('1977-09-11'),
      });

      const response = await request(app).delete(`/api/consoles/${criado._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('sucesso');

      // Confere se realmente foi removido
      const busca = await Console.findById(criado._id);
      expect(busca).toBeNull();
    });

    it('deve retornar 404 ao tentar excluir console inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).delete(`/api/consoles/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar 400 ao enviar ID com formato inválido para exclusão', async () => {
      const response = await request(app).delete('/api/consoles/nao-e-id');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Tratamento de Rotas Inexistentes (404)', () => {
    it('deve retornar 404 padronizado para rota inexistente', async () => {
      const response = await request(app).get('/api/rota-desconhecida');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Rota não encontrada');
    });
  });

});
