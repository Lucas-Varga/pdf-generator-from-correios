const http = require('http');

const data = JSON.stringify({
  sender: {
    name: "João Silva",
    cpf: "473.100.508-60",
    address: "Rua José Soriano de Souza, 990",
    city: "Campinas",
    state: "SP",
    zipCode: "13045-630"
  },
  recipient: {
    name: "Maria Santos",
    address: "Avenida Pedro Vicente de Azevedo, 262",
    city: "Lorena",
    state: "SP",
    zipCode: "12606-050"
  }
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/generate-pdf',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let totalSize = 0;

  res.on('data', (chunk) => {
    totalSize += chunk.length;
  });

  res.on('end', () => {
    console.log('✅ Teste 1 - Dados VÁLIDOS');
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Content-Type: ${res.headers["content-type"]}`);
    console.log(`   Tamanho recebido: ${totalSize} bytes`);
    if (res.statusCode === 200 && totalSize > 1000) {
      console.log(`   ✅ PDF GERADO COM SUCESSO!\n`);
      process.exit(0);
    } else {
      console.log(`   ❌ Problema na resposta\n`);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro na requisição:', error.message);
  process.exit(1);
});

req.write(data);
req.end();
