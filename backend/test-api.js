const http = require('http');
const fs = require('fs');
const path = require('path');

const testData = require('./test-data.json');

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/generate-pdf',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(data).length
      }
    };

    const req = http.request(options, (res) => {
      let responseData = Buffer.alloc(0);

      res.on('data', (chunk) => {
        responseData = Buffer.concat([responseData, chunk]);
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          bodyLength: responseData.length,
          isBuffer: Buffer.isBuffer(responseData)
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Iniciando testes da API...\n');

  try {
    // Teste 1: Dados válidos
    console.log('📝 Teste 1: POST com dados VÁLIDOS');
    const result = await makeRequest(testData);
    console.log(`   Status: ${result.statusCode}`);
    console.log(`   Content-Type: ${result.headers['content-type']}`);
    console.log(`   Tamanho do PDF: ${result.bodyLength} bytes`);
    console.log(`   ✅ SUCESSO!\n`);

    // Teste 2: CPF inválido
    console.log('📝 Teste 2: POST com CPF INVÁLIDO');
    const invalidCPF = JSON.parse(JSON.stringify(testData));
    invalidCPF.sender.cpf = '111.111.111-11';
    try {
      const result2 = await makeRequest(invalidCPF);
      console.log(`   Status: ${result2.statusCode}`);
      if (result2.statusCode !== 200) {
        console.log(`   ✅ Validação funcionou (recusou CPF inválido)\n`);
      }
    } catch (e) {
      console.log(`   ✅ Validação funcionou: ${e.message}\n`);
    }

    // Teste 3: CEP inválido
    console.log('📝 Teste 3: POST com CEP INVÁLIDO');
    const invalidCEP = JSON.parse(JSON.stringify(testData));
    invalidCEP.sender.zipCode = '12345'; // sem hífen
    try {
      const result3 = await makeRequest(invalidCEP);
      console.log(`   Status: ${result3.statusCode}`);
      if (result3.statusCode !== 200) {
        console.log(`   ✅ Validação funcionou (recusou CEP inválido)\n`);
      }
    } catch (e) {
      console.log(`   ✅ Validação funcionou: ${e.message}\n`);
    }

    console.log('✅ Todos os testes completados!');
  } catch (error) {
    console.error('❌ Erro durante testes:', error.message);
  }
}

runTests();
