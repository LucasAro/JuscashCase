# Usar uma imagem base do Python
FROM python:3.10-slim

# Configurar o diretório de trabalho
WORKDIR /app

# Copiar todos os arquivos do projeto para o contêiner
COPY . .

# Instalar as dependências do Python
RUN pip install --no-cache-dir -r requirements.txt

# Comando padrão para o contêiner
CMD ["python", "main.py"]
