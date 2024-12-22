import psycopg2
from psycopg2.extras import execute_values
from config import DB_CONFIG

def get_db_connection():
    """Retorna uma conexão com o banco de dados."""
    return psycopg2.connect(**DB_CONFIG)

def setup_database():
    """Cria a tabela no banco de dados, caso não exista."""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
            CREATE TABLE IF NOT EXISTS public.documentos (
                id SERIAL PRIMARY KEY,
                arquivo TEXT,
                data_disponibilizacao DATE,
                processo TEXT,
                autores TEXT,
                advogados TEXT,
                valor_principal_bruto_liquido NUMERIC(15, 2),
                valor_juros_moratorios NUMERIC(15, 2),
                valor_honorarios_advocaticios NUMERIC(15, 2),
                paragrafo TEXT,
                reu TEXT,
                status TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)
            conn.commit()

def insert_documents(data_list):
    """Insere múltiplos documentos no banco de dados."""
    query = """
    INSERT INTO public.documentos (
        arquivo, data_disponibilizacao, processo, autores, advogados,
        valor_principal_bruto_liquido, valor_juros_moratorios, valor_honorarios_advocaticios,
        paragrafo, reu, status
    ) VALUES %s
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            execute_values(cur, query, data_list)
            conn.commit()
