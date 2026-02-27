const db = require('../db/database');
const { generatePDF } = require('../services/pdfGenerator');
const fs = require('fs');

// Validação de CPF (algoritmo de validação)
function isValidCPF(cpf) {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
}

// Validação de CEP
function isValidCEP(cep) {
  return /^\d{5}-\d{3}$/.test(cep);
}

// Sanitização básica
function sanitizeString(str) {
  return str.trim().substring(0, 200);
}

// Validação de dados de entrada
function validateInput(data) {
  const errors = [];

  // Validação do Remetente
  if (!data.sender) errors.push('Dados do remetente são obrigatórios');
  if (!data.sender?.name) errors.push('Nome do remetente é obrigatório');
  if (!data.sender?.cpf) errors.push('CPF do remetente é obrigatório');
  if (data.sender?.cpf && !isValidCPF(data.sender.cpf)) errors.push('CPF inválido');
  if (!data.sender?.address) errors.push('Endereço do remetente é obrigatório');
  if (!data.sender?.city) errors.push('Cidade do remetente é obrigatória');
  if (!data.sender?.state) errors.push('Estado do remetente é obrigatório');
  if (!data.sender?.zipCode) errors.push('CEP do remetente é obrigatório');
  if (data.sender?.zipCode && !isValidCEP(data.sender.zipCode)) errors.push('CEP do remetente inválido (formato: XXXXX-XXX)');

  // Validação do Destinatário
  if (!data.recipient) errors.push('Dados do destinatário são obrigatórios');
  if (!data.recipient?.name) errors.push('Nome do destinatário é obrigatório');
  if (!data.recipient?.address) errors.push('Endereço do destinatário é obrigatório');
  if (!data.recipient?.city) errors.push('Cidade do destinatário é obrigatória');
  if (!data.recipient?.state) errors.push('Estado do destinatário é obrigatório');
  if (!data.recipient?.zipCode) errors.push('CEP do destinatário é obrigatório');
  if (data.recipient?.zipCode && !isValidCEP(data.recipient.zipCode)) errors.push('CEP do destinatário inválido (formato: XXXXX-XXX)');

  return errors;
}

// Gerar ID único do PDF
function generatePdfId() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `PDF-${date}-${random}`;
}

// Controller principal
async function generatePdfController(req, res) {
  try {
    const { sender, recipient } = req.body;

    // Validar entrada
    const validationErrors = validateInput({ sender, recipient });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Erro na validação dos dados',
        errors: validationErrors
      });
    }

    // Sanitizar dados
    const sanitizedSender = {
      name: sanitizeString(sender.name),
      cpf: sender.cpf.trim(),
      address: sanitizeString(sender.address),
      city: sanitizeString(sender.city),
      state: sanitizeString(sender.state),
      zipCode: sender.zipCode.trim()
    };

    const sanitizedRecipient = {
      name: sanitizeString(recipient.name),
      address: sanitizeString(recipient.address),
      city: sanitizeString(recipient.city),
      state: sanitizeString(recipient.state),
      zipCode: recipient.zipCode.trim()
    };

    // Processar remetente (inserir se novo, ou obter ID existente)
    let senderId;
    await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM senders WHERE cpf = ?',
        [sanitizedSender.cpf],
        (err, row) => {
          if (err) reject(err);
          if (row) {
            senderId = row.id;
            resolve();
          } else {
            db.run(
              'INSERT INTO senders (name, cpf, address, city, state, zip_code) VALUES (?, ?, ?, ?, ?, ?)',
              [sanitizedSender.name, sanitizedSender.cpf, sanitizedSender.address, sanitizedSender.city, sanitizedSender.state, sanitizedSender.zipCode],
              function (err) {
                if (err) reject(err);
                else {
                  senderId = this.lastID;
                  resolve();
                }
              }
            );
          }
        }
      );
    });

    // Inserir destinatário
    let recipientId;
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO recipients (name, address, city, state, zip_code) VALUES (?, ?, ?, ?, ?)',
        [sanitizedRecipient.name, sanitizedRecipient.address, sanitizedRecipient.city, sanitizedRecipient.state, sanitizedRecipient.zipCode],
        function (err) {
          if (err) reject(err);
          else {
            recipientId = this.lastID;
            resolve();
          }
        }
      );
    });

    // Gerar ID único do PDF
    const pdfId = generatePdfId();

    // Gerar PDF
    const pdfInfo = await generatePDF(sanitizedSender, sanitizedRecipient, pdfId);

    // Registrar no histórico
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO pdf_history (pdf_id, sender_id, recipient_id, pdf_filename, file_path) VALUES (?, ?, ?, ?, ?)',
        [pdfId, senderId, recipientId, pdfInfo.pdfFileName, pdfInfo.pdfPath],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Ler arquivo e enviar como resposta
    const pdfBuffer = fs.readFileSync(pdfInfo.pdfPath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfInfo.pdfFileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar PDF',
      error: error.message
    });
  }
}

module.exports = { generatePdfController };
