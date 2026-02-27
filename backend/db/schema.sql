-- Tabela: senders (Remetentes)
CREATE TABLE IF NOT EXISTS senders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: recipients (Destinatários)
CREATE TABLE IF NOT EXISTS recipients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: pdf_history (Histórico de PDFs)
CREATE TABLE IF NOT EXISTS pdf_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pdf_id TEXT NOT NULL UNIQUE,
  sender_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  pdf_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES senders(id),
  FOREIGN KEY (recipient_id) REFERENCES recipients(id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pdf_history_pdf_id ON pdf_history(pdf_id);
CREATE INDEX IF NOT EXISTS idx_senders_cpf ON senders(cpf);
CREATE INDEX IF NOT EXISTS idx_pdf_history_generated_at ON pdf_history(generated_at);
