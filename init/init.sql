-- Caso queira um schema dedicado:
CREATE SCHEMA IF NOT EXISTS public;

-- Tabela de documentos (baseada no JSON)
CREATE TABLE IF NOT EXISTS public.documentos (
    id SERIAL PRIMARY KEY,
    arquivo TEXT,
    data_disponibilizacao TEXT,
    processo TEXT,
    autores TEXT,
    advogados TEXT,
    valor_principal_bruto_liquido NUMERIC(15,2),
    valor_juros_moratorios NUMERIC(15,2),
    valor_honorarios_advocaticios NUMERIC(15,2),
    paragrafo TEXT,
    reu TEXT,
    status TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,  -- Idealmente hash de senha
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Exemplo de índice adicional (opcional):
CREATE INDEX IF NOT EXISTS idx_documentos_processo ON public.documentos (processo);
