# config.py
import os

# Diretório para salvar PDFs
OUTPUT_DIR = "./pdfs2"
os.makedirs(OUTPUT_DIR, exist_ok=True)


# Diretório onde os PDFs estão armazenados
PDF_FOLDER = "./pdfs2"
# Definição da linha de término para o parágrafo
END_LINE = "Publicação Oficial do Tribunal de Justiça do Estado de São Paulo - Lei Federal nº 11.419/06, art. 4º"

# Criar diretório caso não exista
os.makedirs(PDF_FOLDER, exist_ok=True)

# Configurações do banco
DB_CONFIG = {
    'host': '3.135.200.72',
    'port': 5432,
    'database': 'meu_banco',
    'user': 'meu_usuario',
    'password': 'minha_senha_forte'
}

# URLs e Dados
URL_CONSULTA = 'https://dje.tjsp.jus.br/cdje/consultaAvancada.do'
URL_TROCA = 'https://dje.tjsp.jus.br/cdje/trocaDePagina.do'
BASE_URL_PDF = 'https://dje.tjsp.jus.br/cdje/getPaginaDoDiario.do'

HEADERS_INICIAL = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Origin': 'https://dje.tjsp.jus.br',
    'Referer': 'https://dje.tjsp.jus.br/cdje/consultaAvancada.do',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Linux"',
}

HEADERS_TROCA = {
    'Accept': 'text/javascript, text/html, application/xml, text/xml, */*',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'Connection': 'keep-alive',
    'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Origin': 'https://dje.tjsp.jus.br',
    'Referer': 'https://dje.tjsp.jus.br/cdje/consultaAvancada.do',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'X-Prototype-Version': '1.6.0.3',
    'X-Requested-With': 'XMLHttpRequest',
    'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Linux"',
}

DATA_INICIAL = 'dadosConsulta.dtInicio=19%2F11%2F2024&dadosConsulta.dtFim=22%2F12%2F2024&dadosConsulta.cdCaderno=12&dadosConsulta.pesquisaLivre=%22RPV%22+e+%22pagamento+pelo+INSS%22&pagina='
