# FDFS - Gerador de Documentos PDF

Sistema completo para gerar PDFs com dados de remetente e destinatário, incluindo banco de dados para histórico.

## 📋 O que foi criado

✅ **Backend Node.js + Express**
- Servidor na porta 3000
- API POST `/generate-pdf`
- Validação completa de CPF e CEP
- Banco de dados SQLite com histórico

✅ **Banco de Dados**
- 3 tabelas: `senders`, `recipients`, `pdf_history`
- Validação e integridade de dados
- Índices para performance

✅ **Geração de PDF**
- Formato A4, simples e profissional
- ID único para cada PDF
- Armazenamento local em `backend/pdfs/`
- Download automático

✅ **Frontend Atualizado**
- Mapeamento correto de dados para o backend
- Validações de entrada
- Feedback visual (loading)
- Tratamento de erros

---

## 🚀 Como Instalar e Usar

### 1️⃣ Instalação

Abra o terminal na pasta `backend/` e execute:

```bash
cd backend
npm install
```

Isso vai instalar as dependências:
- express
- sqlite3
- pdfkit
- dotenv

### 2️⃣ Iniciar o Servidor

No terminal (dentro da pasta `backend/`):

```bash
npm start
```

Você deve ver:
```
✓ Conectado ao banco de dados SQLite
✓ Banco de dados inicializado

🚀 Servidor rodando em http://localhost:3000
📁 PDFs sendo salvos em: ./pdfs
✓ Frontend disponível em http://localhost:3000/document/index.html
```

### 3️⃣ Abrir o Frontend

Abra no navegador (depois que o servidor estiver rodando):
```
http://localhost:3000/document/index.html
```

### 4️⃣ Usar a Aplicação

1. Preencha os dados do **Remetente** (Nome, CPF, Endereço, Cidade, Estado, CEP)
2. Preencha os dados do **Destinatário** (Nome, Endereço, Cidade, Estado, CEP)
3. Clique em **"Gerar PDF"**
4. O PDF será baixado e aberto em nova aba
5. Você pode **imprimir** ou **salvar localmente**

---

## 📁 Estrutura de Arquivos

```
fdfs/
├── backend/                    # Novo - Backend Node.js
│   ├── package.json
│   ├── .env
│   ├── .gitignore
│   ├── server.js              # Servidor principal
│   ├── db/
│   │   ├── schema.sql         # Estrutura do banco
│   │   └── database.js        # Conexão e inicialização
│   ├── routes/
│   │   └── pdf.js             # Rota POST /generate-pdf
│   ├── controllers/
│   │   └── pdfController.js   # Lógica de negócio
│   ├── services/
│   │   └── pdfGenerator.js    # Geração de PDF
│   ├── pdfs/                  # Pasta para PDFs gerados
│   ├── node_modules/          # Dependências (após npm install)
│   └── db/documents.db        # Banco de dados SQLite (criado automaticamente)
│
├── css/                        # Existente
│   └── style.css
├── js/                         # Atualizado
│   └── script.js              # Frontend atualizado
└── document/                   # Existente
    └── index.html
```

---

## ✅ Testes

### Teste 1: Verificar se o servidor iniciou
```
Terminal deve mostrar:
✓ Conectado ao banco de dados SQLite
✓ Banco de dados inicializado
🚀 Servidor rodando em http://localhost:3000
```

### Teste 2: Testar com dados válidos
- Nome Remetente: `João Silva`
- CPF: `473.100.508-60` (válido)
- Endereço Remetente: `Rua A, 123`
- Cidade Remetente: `São Paulo`
- Estado: `SP`
- CEP: `01234-567`

- Nome Destinatário: `Maria Santos`
- Endereço Destinatário: `Avenida B, 456`
- Cidade Destinatário: `Rio de Janeiro`
- Estado: `RJ`
- CEP: `20000-000`

✅ Resultado esperado: PDF baixa e abre em nova aba

### Teste 3: Testar validações
- Deixar campo vazio → Deve mostrar erro
- CPF inválido → Deve mostrar erro
- CEP em formato errado → Deve mostrar erro

### Teste 4: Verificar banco de dados
Arquivos criados:
- ✅ `backend/db/documents.db` (banco de dados)
- ✅ `backend/pdfs/PDF-YYYYMMDD-XXXXXX.pdf` (PDFs gerados)

---

## 🐛 Solução de Problemas

### "Connection refused on port 3000"
- Verifique se o servidor está rodando com `npm start`
- Verifique se a porta 3000 está disponível
- Tente `npm start` novamente

### "Cannot find module 'express'"
- Certifique-se de estar na pasta `backend/`
- Execute `npm install`

### "Database locked"
- Feche a aba do navegador com o frontend
- Reinicie o servidor com `npm start`

### PDF não está sendo gerado
- Verifique o console para mensagens de erro
- Certifique-se de que a pasta `backend/pdfs/` foi criada
- Verifique permissões de escrita no disco

---

## 📊 Banco de Dados

### Tabela: `senders` (Remetentes)
```sql
- id (Inteiro, chave primária)
- name (Texto)
- cpf (Texto, único)
- address (Texto)
- city (Texto)
- state (Texto)
- zip_code (Texto)
- created_at (Data/Hora)
```

### Tabela: `recipients` (Destinatários)
```sql
- id (Inteiro, chave primária)
- name (Texto)
- address (Texto)
- city (Texto)
- state (Texto)
- zip_code (Texto)
- created_at (Data/Hora)
```

### Tabela: `pdf_history` (Histórico)
```sql
- id (Inteiro, chave primária)
- pdf_id (Texto, único) - Ex: PDF-20260226-123456
- sender_id (Inteiro, referencia senders)
- recipient_id (Inteiro, referencia recipients)
- pdf_filename (Texto)
- file_path (Texto)
- generated_at (Data/Hora)
```

---

## 🔒 Segurança

✅ Validação de CPF (algoritmo de verificação)
✅ Validação de CEP (formato correto)
✅ Sanitização de strings
✅ Validação no backend (não confiar só no frontend)
✅ Sem exposição de caminhos internos

---

## 🚀 Próximas Melhorias (Futuro)

- [ ] Autenticação com login/senha
- [ ] Interface para visualizar histórico de PDFs
- [ ] Buscar PDFs por CPF
- [ ] Excluir PDFs antigos
- [ ] Exportar dados em CSV/Excel
- [ ] Deploy em produção (Heroku, Railway, DigitalOcean)

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique o console do navegador (F12)
2. Verifique o terminal onde rodou `npm start`
3. Verifique se todas as dependências foram instaladas com `npm install`

---

**Status**: ✅ Pronto para usar!
