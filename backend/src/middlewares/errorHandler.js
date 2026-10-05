/**
 * Middleware centralizado de tratamento de erros da aplicação.
 * Garante respostas JSON consistentes para todos os tipos de erros.
 */
function errorHandler(err, req, res, next) {
  console.error('[API Error]', err);

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      error: 'Dados de entrada inválidos.',
      details: messages,
    });
  }

  // Erro de CastError do Mongoose (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: `Formato inválido para o campo '${err.path}'. O valor informado não é um identificador válido.`,
    });
  }

  // Erro de sintaxe JSON no corpo da requisição
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Corpo da requisição contém JSON com sintaxe inválida.',
    });
  }

  // Erro genérico / interno
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: err.message || 'Erro interno do servidor.',
  });
}

/**
 * Middleware para rotas não encontradas (404)
 */
function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    error: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
