const mongoose = require('mongoose');
const Console = require('../models/Console');
const connectDB = require('../config/db');

/**
 * Health check da aplicação e verificação de conexão com o banco.
 * GET /api/health
 */
async function getHealth(req, res) {
  let dbStatus = 'disconnected';
  try {
    await connectDB();
    const state = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (state === 1) {
      dbStatus = 'connected';
    } else if (state === 2) {
      dbStatus = 'connecting';
    }
  } catch (err) {
    dbStatus = 'error: ' + err.message;
  }

  return res.status(200).json({
    success: true,
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
}

/**
 * Lista todos os consoles cadastrados.
 * GET /api/consoles
 */
async function listConsoles(req, res, next) {
  try {
    await connectDB();
    const consoles = await Console.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: consoles.length,
      data: consoles,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Busca um console específico pelo ID.
 * GET /api/consoles/:id
 */
async function getConsoleById(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'O identificador fornecido possui formato inválido.',
      });
    }

    await connectDB();
    const consoleItem = await Console.findById(id);

    if (!consoleItem) {
      return res.status(404).json({
        success: false,
        error: 'Console não encontrado com o ID informado.',
      });
    }

    return res.status(200).json({
      success: true,
      data: consoleItem,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Cadastra um novo console.
 * POST /api/consoles
 */
async function createConsole(req, res, next) {
  try {
    const { empresa, modelo, preco, foto, dataLancamento } = req.body;

    // Validações manuais preliminares amigáveis
    const errors = [];
    if (!empresa || typeof empresa !== 'string' || !empresa.trim()) {
      errors.push('O campo empresa é obrigatório.');
    }
    if (!modelo || typeof modelo !== 'string' || !modelo.trim()) {
      errors.push('O campo modelo é obrigatório.');
    }
    if (preco === undefined || preco === null || isNaN(Number(preco)) || Number(preco) < 0) {
      errors.push('O campo preco deve ser um valor numérico maior ou igual a zero.');
    }
    if (!foto || typeof foto !== 'string' || !foto.trim()) {
      errors.push('O campo foto é obrigatório.');
    }
    if (!dataLancamento || isNaN(new Date(dataLancamento).getTime())) {
      errors.push('O campo dataLancamento deve ser uma data válida.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Dados de entrada inválidos.',
        details: errors,
      });
    }

    await connectDB();

    const novoConsole = await Console.create({
      empresa: empresa.trim(),
      modelo: modelo.trim(),
      preco: Number(preco),
      foto: foto.trim(),
      dataLancamento: new Date(dataLancamento),
    });

    return res.status(201).json({
      success: true,
      message: 'Console cadastrado com sucesso.',
      data: novoConsole,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Atualiza os dados de um console existente.
 * PUT /api/consoles/:id
 */
async function updateConsole(req, res, next) {
  try {
    const { id } = req.params;
    const { empresa, modelo, preco, foto, dataLancamento } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'O identificador fornecido possui formato inválido.',
      });
    }

    // Validação de dados caso informados
    const errors = [];
    if (empresa !== undefined && (!empresa || typeof empresa !== 'string' || !empresa.trim())) {
      errors.push('O campo empresa não pode ser vazio.');
    }
    if (modelo !== undefined && (!modelo || typeof modelo !== 'string' || !modelo.trim())) {
      errors.push('O campo modelo não pode ser vazio.');
    }
    if (preco !== undefined && (isNaN(Number(preco)) || Number(preco) < 0)) {
      errors.push('O campo preco deve ser numérico e não negativo.');
    }
    if (foto !== undefined && (!foto || typeof foto !== 'string' || !foto.trim())) {
      errors.push('O campo foto não pode ser vazio.');
    }
    if (dataLancamento !== undefined && isNaN(new Date(dataLancamento).getTime())) {
      errors.push('O campo dataLancamento deve conter uma data válida.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Dados para atualização inválidos.',
        details: errors,
      });
    }

    await connectDB();

    const updateData = {};
    if (empresa !== undefined) updateData.empresa = empresa.trim();
    if (modelo !== undefined) updateData.modelo = modelo.trim();
    if (preco !== undefined) updateData.preco = Number(preco);
    if (foto !== undefined) updateData.foto = foto.trim();
    if (dataLancamento !== undefined) updateData.dataLancamento = new Date(dataLancamento);

    const consoleAtualizado = await Console.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!consoleAtualizado) {
      return res.status(404).json({
        success: false,
        error: 'Console não encontrado com o ID informado.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Console atualizado com sucesso.',
      data: consoleAtualizado,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Remove um console pelo ID.
 * DELETE /api/consoles/:id
 */
async function deleteConsole(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'O identificador fornecido possui formato inválido.',
      });
    }

    await connectDB();
    const consoleExcluido = await Console.findByIdAndDelete(id);

    if (!consoleExcluido) {
      return res.status(404).json({
        success: false,
        error: 'Console não encontrado com o ID informado.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Console excluído com sucesso.',
      data: consoleExcluido,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getHealth,
  listConsoles,
  getConsoleById,
  createConsole,
  updateConsole,
  deleteConsole,
};
