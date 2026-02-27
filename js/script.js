// script.js

document.getElementById('documentForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const form = event.target;

    // Mapear dados do formulário para o formato esperado pelo backend
    const sender = {
        name: form.querySelector('[name="senderName"]').value,
        cpf: form.querySelector('[name="senderCpf"]').value,
        address: (form.querySelector('[name="senderAddressLine1"]').value +
                  (form.querySelector('[name="senderAddressLine2"]').value ? ', ' + form.querySelector('[name="senderAddressLine2"]').value : '')).trim(),
        city: form.querySelector('[name="senderCity"]').value,
        state: form.querySelector('[name="senderState"]').value,
        zipCode: form.querySelector('[name="senderZip"]').value
    };

    const recipient = {
        name: form.querySelector('[name="recipientName"]').value,
        address: (form.querySelector('[name="recipientAddressLine1"]').value +
                  (form.querySelector('[name="recipientAddressLine2"]').value ? ', ' + form.querySelector('[name="recipientAddressLine2"]').value : '')).trim(),
        city: form.querySelector('[name="recipientCity"]').value,
        state: form.querySelector('[name="recipientState"]').value,
        zipCode: form.querySelector('[name="recipientZip"]').value
    };

    const data = { sender, recipient };

    // Validação básica
    if (!sender.name || !recipient.name || !sender.address || !recipient.address) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Botão de loading para feedback ao usuário
    const generateButton = form.querySelector('.generate-button');
    const originalButtonText = generateButton.textContent;
    generateButton.textContent = 'Gerando PDF...';
    generateButton.disabled = true;

    try {
        // Envia os dados para o backend
        const response = await fetch('http://localhost:3000/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            // Se a resposta não for OK (ex: erro 400, 500)
            const responseData = await response.json().catch(() => ({}));
            const errorMessage = responseData.message || `Erro ao gerar PDF: ${response.status}`;
            const errors = responseData.errors ? '\n\n' + responseData.errors.join('\n') : '';
            throw new Error(`${errorMessage}${errors}`);
        }

        // Se a resposta for um blob (o PDF)
        const pdfBlob = await response.blob();
        const url = URL.createObjectURL(pdfBlob);

        // Abre o PDF em uma nova aba para visualização e impressão
        window.open(url, '_blank');

        alert('PDF gerado com sucesso! Verifique sua janela pop-up.');

    } catch (error) {
        console.error('Erro:', error);
        alert(`Ocorreu um erro ao gerar o documento:\n\n${error.message}\n\nPor favor, tente novamente.`);
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
