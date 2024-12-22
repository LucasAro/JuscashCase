import os
import re
import pdfplumber
from decimal import Decimal, InvalidOperation
from datetime import datetime
from config import PDF_FOLDER, END_LINE
from database_utils import insert_documents

# Regex
REGEX_DATA_DISPONIBILIZACAO = re.compile(
    r'(\b(?:segunda-feira|terça-feira|quarta-feira|quinta-feira|sexta-feira|sábado|domingo), \d{1,2} de \w+ de \d{4}\b)'
)
REGEX_PROCESSO = re.compile(r'Processo\s+(\S+)')
REGEX_AUTORES = re.compile(r'-\s*([^-]+?)\s*-\s*Vistos\.?(?:\s*1\))?')
REGEX_ADVOGADOS = re.compile(r'ADV:\s*(.*?)(?=$|\n)')
REGEX_PARCELAS = re.compile(r'R\$[\s]*([\d.,-]+)\s*-\s*([a-zA-Z\s/çáéíóú]+);?', re.UNICODE)

# Dicionário para tradução de meses
MESES = {
    "janeiro": 1,
    "fevereiro": 2,
    "março": 3,
    "abril": 4,
    "maio": 5,
    "junho": 6,
    "julho": 7,
    "agosto": 8,
    "setembro": 9,
    "outubro": 10,
    "novembro": 11,
    "dezembro": 12,
}

def converter_valor(valor_str):
    """Converte valor monetário em Decimal."""
    try:
        if not valor_str:
            return None
        valor_limpo = valor_str.strip().rstrip(',').replace('.', '').replace(',', '.')
        return Decimal(valor_limpo)
    except (InvalidOperation, ValueError):
        return None

def converter_data(data_texto):
    """Converte uma data em texto para datetime.date."""
    if not data_texto:
        return None
    try:
        # Remove o dia da semana e separa os componentes
        partes = data_texto.split(",")[1].strip()  # Ex: "18 de dezembro de 2024"
        dia, mes_texto, ano = partes.split(" de ")

        # Converte os componentes para valores numéricos
        dia = int(dia)
        mes = MESES[mes_texto.lower()]
        ano = int(ano)

        # Retorna um objeto datetime.date
        return datetime(ano, mes, dia).date()
    except (KeyError, ValueError, IndexError):
        return None

def process_pdf(file_path):
    """Processa um único PDF e retorna os dados extraídos."""
    resultados = []
    with pdfplumber.open(file_path) as pdf:
        full_text = "\n".join([page.extract_text() for page in pdf.pages if page.extract_text()])

    # Extrair data de disponibilização
    m_data = REGEX_DATA_DISPONIBILIZACAO.search(full_text)
    data_disponibilizacao_texto = m_data.group(1).strip() if m_data else None
    data_disponibilizacao = converter_data(data_disponibilizacao_texto)

    # Processar parágrafos
    lines = [l.strip() for l in full_text.split('\n')]
    paragrafos = []
    current_paragraph = []
    capturing = False

    for i, line in enumerate(lines):
        if line.startswith("Processo "):
            if current_paragraph:
                current_paragraph = []
            capturing = True
            current_paragraph.append(line)
        elif capturing:
            current_paragraph.append(line)

        if capturing:
            if "ADV:" in line or (i < len(lines) - 1 and lines[i + 1].strip().startswith(END_LINE)):
                paragraph_text = " ".join(current_paragraph).strip()
                capturing = False
                current_paragraph = []
                if "rpv" in paragraph_text.lower() and "pagamento pelo inss" in paragraph_text.lower():
                    paragrafos.append(paragraph_text)

    # Extrair informações dos parágrafos
    for paragrafo in paragrafos:
        m_proc = REGEX_PROCESSO.search(paragrafo)
        numero_processo = m_proc.group(1) if m_proc else None

        m_autores = REGEX_AUTORES.search(paragrafo)
        autores = m_autores.group(1).strip() if m_autores else None

        m_adv = REGEX_ADVOGADOS.search(paragrafo)
        advogados = m_adv.group(1).strip() if m_adv else None

        valor_bruto = None
        valor_juros = None
        valor_honorarios = None

        parcelas = REGEX_PARCELAS.findall(paragrafo)
        for val, desc in parcelas:
            val = val.strip()
            if val == '-':
                val = '0,00'
            desc_lower = desc.lower()
            if 'principal' in desc_lower:
                valor_bruto = val
            elif 'juros moratório' in desc_lower:
                valor_juros = val
            elif 'honorário' in desc_lower:
                valor_honorarios = val

        # Converter valores
        valor_bruto = converter_valor(valor_bruto)
        valor_juros = converter_valor(valor_juros)
        valor_honorarios = converter_valor(valor_honorarios)

        resultados.append((
            os.path.basename(file_path),
            data_disponibilizacao,
            numero_processo,
            autores,
            advogados,
            valor_bruto,
            valor_juros,
            valor_honorarios,
            paragrafo,
            "Instituto Nacional do Seguro Social - INSS",
            "nova",
        ))

    return resultados

def process_all_pdfs():
    """Processa todos os PDFs no diretório especificado."""
    all_results = []
    for filename in os.listdir(PDF_FOLDER):
        if filename.lower().endswith(".pdf"):
            file_path = os.path.join(PDF_FOLDER, filename)
            print(f"Processando arquivo: {file_path}")
            results = process_pdf(file_path)
            all_results.extend(results)
    insert_documents(all_results)
    print("Todos os PDFs foram processados.")
