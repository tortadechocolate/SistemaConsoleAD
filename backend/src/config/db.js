const mongoose = require('mongoose');

/**
 * Cache global da conexão Mongoose para evitar que múltiplas conexões
 * sejam abertas a cada invocação de função serverless (Vercel).
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Conecta ao MongoDB utilizando cache de conexão singleton.
 * @returns {Promise<typeof mongoose>}
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/consoles_db';

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log(`[MongoDB] Conectado com sucesso a: ${m.connection.host}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.error('[MongoDB] Erro ao conectar ao banco de dados:', err.message);
    throw err;
  }

  return cached.conn;
}

module.exports = connectDB;
