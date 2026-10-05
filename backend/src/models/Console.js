const mongoose = require('mongoose');

const consoleSchema = new mongoose.Schema(
  {
    empresa: {
      type: String,
      required: [true, 'O campo empresa é obrigatório.'],
      trim: true,
      minlength: [2, 'O nome da empresa deve ter pelo menos 2 caracteres.'],
      maxlength: [100, 'O nome da empresa não pode exceder 100 caracteres.'],
    },
    modelo: {
      type: String,
      required: [true, 'O campo modelo é obrigatório.'],
      trim: true,
      minlength: [1, 'O modelo deve ter pelo menos 1 caractere.'],
      maxlength: [100, 'O modelo não pode exceder 100 caracteres.'],
    },
    preco: {
      type: Number,
      required: [true, 'O campo preco é obrigatório.'],
      min: [0, 'O preço deve ser um valor positivo ou zero.'],
    },
    foto: {
      type: String,
      required: [true, 'O campo foto é obrigatório.'],
      trim: true,
      validate: {
        validator: function (v) {
          // Permite URLs http, https ou caminhos válidos
          return /^(https?:\/\/|\/|data:image\/).+/i.test(v);
        },
        message: (props) => `${props.value} não é uma URL ou caminho de imagem válido!`,
      },
    },
    dataLancamento: {
      type: Date,
      required: [true, 'O campo dataLancamento é obrigatório.'],
      validate: {
        validator: function (v) {
          return !isNaN(new Date(v).getTime());
        },
        message: 'A data de lançamento informada é inválida.',
      },
    },
  },
  {
    timestamps: true, // Cria automaticamente createdAt e updatedAt
    versionKey: false,
  }
);

// Converte datas para ISO format amigável no toJSON
consoleSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Console = mongoose.models.Console || mongoose.model('Console', consoleSchema);

module.exports = Console;
