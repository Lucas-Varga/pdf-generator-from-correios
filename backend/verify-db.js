const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db/documents.db', (err) => {
  if (err) {
    console.error('Erro ao conectar:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado ao banco de dados\n');

  // Verificar Remetentes
  console.log('📋 TABELA: senders (Remetentes)');
  db.all('SELECT * FROM senders ORDER BY id DESC LIMIT 5', (err, rows) => {
    if (err) {
      console.error('Erro ao consultar senders:', err.message);
    } else {
      console.log(`   Total de remetentes: ${rows.length}`);
      rows.forEach(row => {
        console.log(`   - ID: ${row.id}, Nome: ${row.name}, CPF: ${row.cpf}`);
      });
    }
    console.log('');

    // Verificar Destinatários
    console.log('📋 TABELA: recipients (Destinatários)');
    db.all('SELECT * FROM recipients ORDER BY id DESC LIMIT 5', (err, rows) => {
      if (err) {
        console.error('Erro ao consultar recipients:', err.message);
      } else {
        console.log(`   Total de destinatários: ${rows.length}`);
        rows.forEach(row => {
          console.log(`   - ID: ${row.id}, Nome: ${row.name}, Cidade: ${row.city}`);
        });
      }
      console.log('');

      // Verificar Histórico
      console.log('📋 TABELA: pdf_history (Histórico)');
      db.all('SELECT * FROM pdf_history ORDER BY id DESC LIMIT 5', (err, rows) => {
        if (err) {
          console.error('Erro ao consultar pdf_history:', err.message);
        } else {
          console.log(`   Total de PDFs gerados: ${rows.length}`);
          rows.forEach(row => {
            console.log(`   - ID: ${row.id}, PDF_ID: ${row.pdf_id}, Sender: ${row.sender_id}, Recipient: ${row.recipient_id}`);
          });
        }
        console.log('\n✅ Banco de dados verificado com sucesso!');
        db.close();
        process.exit(0);
      });
    });
  });
});
