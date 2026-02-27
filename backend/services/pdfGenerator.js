const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

function generatePDF(sender, recipient, pdfId) {
  return new Promise((resolve, reject) => {
    try {
      const pdfFileName = `${pdfId}.pdf`;
      const pdfPath = path.join(process.env.PDFS_FOLDER || './pdfs', pdfFileName);

      // Criar documento
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      // Garantir que a pasta existe
      const pdfDir = path.dirname(pdfPath);
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      // Stream para salvar arquivo
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      // Dados da geração
      const now = new Date();
      const dataFormatada = now.toLocaleString('pt-BR');

      // Cabeçalho
      doc.fontSize(20).font('Helvetica-Bold').text('DOCUMENTO', { align: 'center' });
      doc.fontSize(12).font('Helvetica').text(`ID: ${pdfId}`, { align: 'center' });
      doc.fontSize(10).text(`Data: ${dataFormatada}`, { align: 'center' });

      doc.moveDown(0.5);
      doc.strokeColor('#000000').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Seção do Remetente
      doc.fontSize(12).font('Helvetica-Bold').text('DADOS DO REMETENTE');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Nome: ${sender.name}`);
      doc.text(`CPF: ${sender.cpf}`);
      doc.text(`Endereço: ${sender.address}`);
      doc.text(`Cidade: ${sender.city}`);
      doc.text(`Estado: ${sender.state}`);
      doc.text(`CEP: ${sender.zipCode}`);

      doc.moveDown(1);
      doc.strokeColor('#000000').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Seção do Destinatário
      doc.fontSize(12).font('Helvetica-Bold').text('DADOS DO DESTINATÁRIO');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Nome: ${recipient.name}`);
      doc.text(`Endereço: ${recipient.address}`);
      doc.text(`Cidade: ${recipient.city}`);
      doc.text(`Estado: ${recipient.state}`);
      doc.text(`CEP: ${recipient.zipCode}`);

      doc.moveDown(1);
      doc.strokeColor('#000000').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();

      // Rodapé
      doc.moveDown(1);
      doc.fontSize(9).text('Documento gerado automaticamente', { align: 'center' });

      // Finalizar PDF
      doc.end();

      stream.on('finish', () => {
        resolve({
          pdfPath,
          pdfFileName,
          size: fs.statSync(pdfPath).size
        });
      });

      stream.on('error', (err) => {
        reject(new Error(`Erro ao salvar PDF: ${err.message}`));
      });

      doc.on('error', (err) => {
        reject(new Error(`Erro ao gerar PDF: ${err.message}`));
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generatePDF };
