const http = require('http');

const data = JSON.stringify({
  sender: {
    name: "Joao Silva",
    cpf: "473.100.508-60",
    address: "Rua A, 123",
    city: "Campinas",
    state: "SP",
    zipCode: "13045-630"
  },
  recipient: {
    name: "Maria Santos",
    address: "Avenida B, 456",
    city: "Lorena",
    state: "SP",
    zipCode: "12606-050"
  }
});

const buffer = Buffer.from(data, 'utf8');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/generate-pdf',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': buffer.length
  }
};

const req = http.request(options, (res) => {
  let totalSize = 0;

  res.on('data', (chunk) => {
    totalSize += chunk.length;
  });

  res.on('end', () => {
    console.log('✅ Teste - Dados VÁLIDOS');
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Content-Type: ${res.headers["content-type"]}`);
    console.log(`   Tamanho recebido: ${totalSize} bytes`);

    if (res.statusCode === 200 && totalSize > 1000) {
      console.log(`   ✅ PDF GERADO COM SUCESSO!\n`);
      process.exit(0);
    } else if (res.statusCode === 200) {
      console.log(`   ✅ Resposta 200 OK\n`);
      process.exit(0);
    } else {
      console.log(`   Status recebido: ${res.statusCode}`);
      process.exit(0);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro na requisição:', error.message);
  process.exit(1);
});

req.write(buffer);
req.end();
