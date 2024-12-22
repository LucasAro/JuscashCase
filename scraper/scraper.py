import requests
import re
from bs4 import BeautifulSoup
from config import URL_CONSULTA, URL_TROCA, BASE_URL_PDF, OUTPUT_DIR, HEADERS_INICIAL, HEADERS_TROCA, DATA_INICIAL
import os

def clear_output_directory(output_dir):
    """Remove todos os arquivos na pasta de saída."""
    if os.path.exists(output_dir):
        for file_name in os.listdir(output_dir):
            file_path = os.path.join(output_dir, file_name)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)  # Remove arquivos ou links
                elif os.path.isdir(file_path):
                    os.rmdir(file_path)  # Remove diretórios vazios
            except Exception as e:
                print(f"Erro ao apagar {file_path}: {e}")
        print(f"Pasta {output_dir} limpa.")
    else:
        os.makedirs(output_dir)
        print(f"Pasta {output_dir} criada.")


def download_pdf(pdf_url, save_path, session):
    """Baixa um PDF da URL fornecida."""
    print(f"Baixando PDF de: {pdf_url}")
    try:
        response = session.get(pdf_url, stream=True, timeout=30)
        if response.status_code == 200 and 'application/pdf' in response.headers.get('Content-Type', ''):
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)
            print(f"PDF salvo em: {save_path}")
        else:
            print(f"Falha ao baixar PDF. Status: {response.status_code}. Tipo: {response.headers.get('Content-Type')}")
    except requests.exceptions.RequestException as e:
        print(f"Erro ao baixar PDF: {e}")

def fetch_pdfs_from_page(response_text, session, unique_pdf_urls, pdf_count):
    """Extrai links de PDFs da página HTML e faz o download."""
    popup_links = re.findall(r"popup\('(/cdje/consultaSimples\.do\?.+?)'\)", response_text)
    print(f"Encontrados {len(popup_links)} links de PDFs na página.")

    for relative_url in popup_links:
        params_match = re.search(r'\?(.*)', relative_url)
        if params_match:
            params = params_match.group(1)
            pdf_url = f"{BASE_URL_PDF}?{params}&uuidCaptcha="
            if pdf_url not in unique_pdf_urls:
                unique_pdf_urls.add(pdf_url)
                pdf_name = os.path.join(OUTPUT_DIR, f"documento_{pdf_count[0]}.pdf")
                download_pdf(pdf_url, pdf_name, session)
                pdf_count[0] += 1

def run_scraper():
    """Executa o scraper para baixar PDFs de todas as páginas."""
    clear_output_directory(OUTPUT_DIR)  # Limpa a pasta antes de começar

    session = requests.Session()
    unique_pdf_urls = set()
    pdf_count = [1]  # Usar uma lista para manter referência mutável

    try:
        # Primeira requisição
        print("Fazendo a requisição inicial...")
        response = session.post(URL_CONSULTA, headers=HEADERS_INICIAL, data=DATA_INICIAL)
        response.raise_for_status()
        fetch_pdfs_from_page(response.text, session, unique_pdf_urls, pdf_count)

        # Iterar sobre páginas subsequentes
        page_number = 2
        while True:
            print(f"Fazendo requisição para a página {page_number}...")
            troca_data = f'pagina={page_number}&_='

            # Atualizar os cookies (Session já faz isso automaticamente)
            cookies_str = '; '.join([f"{key}={value}" for key, value in session.cookies.get_dict().items()])
            HEADERS_TROCA['Cookie'] = cookies_str

            troca_response = session.post(URL_TROCA, headers=HEADERS_TROCA, data=troca_data)
            troca_response.raise_for_status()

            # Verificar se há links na nova página
            previous_count = len(unique_pdf_urls)
            fetch_pdfs_from_page(troca_response.text, session, unique_pdf_urls, pdf_count)

            # Se não houver novos PDFs, encerramos o loop
            if len(unique_pdf_urls) == previous_count:
                print("Nenhum novo PDF encontrado, finalizando.")
                break

            page_number += 1

        print("Scraping concluído com sucesso!")
    except requests.exceptions.RequestException as e:
        print(f"Erro durante a execução do scraper: {e}")


if __name__ == "__main__":
    run_scraper()
