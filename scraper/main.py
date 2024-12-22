from scraper import run_scraper
from pdf_processor import process_all_pdfs
from database_utils import setup_database
import sys

def main():
    print("Iniciando processo completo...")

    # Configurações iniciais (criação de tabela)
    setup_database()

    # Etapa 1: Executar o scraper para baixar PDFs
    print("Executando scraper para baixar PDFs...")
    run_scraper()

    # Etapa 2: Processar PDFs e inserir dados no banco
    print("Processando PDFs e inserindo dados no banco...")
    process_all_pdfs()

    print("Processo concluído com sucesso!")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Erro durante a execução: {e}")
    finally:
        print("Finalizando contêiner.")
        sys.exit(0)