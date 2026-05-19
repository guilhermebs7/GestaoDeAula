CREATE TABLE planos_aula (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  objetivo TEXT NOT NULL,
  resumo TEXT NOT NULL,
  data_prevista DATE NOT NULL,
  disciplina VARCHAR(120) NOT NULL,
  conteudos JSONB NOT NULL DEFAULT '[]',
  recursos JSONB NOT NULL DEFAULT '[]',
  tags JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);