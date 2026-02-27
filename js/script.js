// script.js

document.getElementById('documentForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const form = event.target;
    const formData = new FormData(form);
    const data = {};

    // Coleta todos os dados do formulário
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    // Validação básica (pode ser expandida)
    if (!data.senderName || !data.recipientName || !data.senderAddressLine1) {
        alert('Por favor, preencha todos os campos obrigatórios (Nome e Endereço).');
        return;
    }

    // Botão de loading para feedback ao usuário
    const generateButton = form.querySelector('.generate-button');
    const originalButtonText = generateButton.textContent;
    generateButton.textContent = 'Gerando PDF...';
    generateButton.disabled = true;

    try {
        // Envia os dados para o backend
        // Certifique-se de que a URL do backend está correta.
        // Se estiver rodando localmente na porta 3000, seria 'http://localhost:3000/generate-pdf'
        const response = await fetch('http://localhost:3000/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            // Se a resposta não for OK (ex: erro 400, 500)
            const errorText = await response.text();
            throw new Error(`Erro ao gerar PDF: ${response.status} - ${errorText}`);
        }

        // Se a resposta for um blob (o PDF)
        const pdfBlob = await response.blob();
        const url = URL.createObjectURL(pdfBlob);

        // Abre o PDF em uma nova aba para visualização e impressão
        window.open(url, '_blank');

        // Opcional: para download direto
        // const a = document.createElement('a');
        // a.href = url;
        // a.download = 'documento_gerado.pdf';
        // document.body.appendChild(a);
        // a.click();
        // document.body.removeChild(a);
        // URL.revokeObjectURL(url); // Libera o objeto URL

    } catch (error) {
        console.error('Erro:', error);
        alert(`Ocorreu um erro ao gerar o documento: ${error.message}. Por favor, tente novamente.`);
    } finally {
        // Restaura o botão
        generateButton.textContent = originalButtonText;
        generateButton.disabled = false;
    }
});

// Máscara para CPF e CEP (opcional, para melhor UX)
document.addEventListener('DOMContentLoaded', () => {
    const senderCpfInput = document.getElementById('senderCpf');
    const senderZipInput = document.getElementById('senderZip');
    const recipientZipInput = document.getElementById('recipientZip');

    // Máscara para CPF: XXX.XXX.XXX-XX
    senderCpfInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
        if (value.length > 11) value = value.substring(0, 11);
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = value;
    });

    // Máscara para CEP: XXXXX-XXX
    const applyZipMask = (input) => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
            if (value.length > 8) value = value.substring(0, 8);
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        });
    };

    applyZipMask(senderZipInput);
    applyZipMask(recipientZipInput);
});
