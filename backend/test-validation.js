const http = require('http');

function testValidation(testName, data) {
  return new Promise((resolve) => {
    const jsonData = JSON.stringify(data);
    const buffer = Buffer.from(jsonData, 'utf8');

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
      let responseText = '';

      res.on('data', (chunk) => {
        responseText += chunk.toString();
      });

      res.on('end', () => {
        resolve({
          testName,
          statusCode: res.statusCode,
          response: responseText.substring(0, 200)
        });
      });
    });

    req.on('error', () => {
      resolve({
        testName,
        statusCode: 'ERROR',
        response: 'Connection error'
      });
    });

    req.write(buffer);
    req.end();
  });
}

async function runValidationTests() {
  console.log('🧪 TESTES DE VALIDAÇÃO\n');

  const tests = [
    {
      name: 'CPF INVÁLIDO (111.111.111-11)',
      data: {
        sender: {
          name: "Test",
          cpf: "111.111.111-11",
          address: "Rua A",
          city: "Sao Paulo",
          state: "SP",
          zipCode: "01234-567"
        },
        recipient: {
          name: "Test 2",
          address: "Rua B",
          city: "Rio",
          state: "RJ",
          zipCode: "20000-000"
        }
      }
    },
    {
      name: 'CEP INVÁLIDO (sem hífen)',
      data: {
        sender: {
          name: "Test",
          cpf: "473.100.508-60",
          address: "Rua A",
          city: "Sao Paulo",
          state: "SP",
          zipCode: "01234567"
        },
        recipient: {
          name: "Test 2",
          address: "Rua B",
          city: "Rio",
          state: "RJ",
          zipCode: "20000-000"
        }
      }
    },
    {
      name: 'CAMPO VAZIO (nome do remetente)',
      data: {
        sender: {
          name: "",
          cpf: "473.100.508-60",
          address: "Rua A",
          city: "Sao Paulo",
          state: "SP",
          zipCode: "01234-567"
        },
        recipient: {
          name: "Test 2",
          address: "Rua B",
          city: "Rio",
          state: "RJ",
          zipCode: "20000-000"
        }
      }
    }
  ];

  for (const test of tests) {
    const result = await testValidation(test.name, test.data);
    console.log(`📝 Teste: ${result.testName}`);
    console.log(`   Status: ${result.statusCode}`);
    if (result.statusCode !== 200) {
      console.log(`   ✅ Validação FUNCIONOU (rejeitado como esperado)`);
    } else {
      console.log(`   ❌ Validação NÃO funcionou (foi aceito)`);
    }
    console.log('');
  }

  console.log('✅ Testes de validação completos!');
  process.exit(0);
}

runValidationTests();
