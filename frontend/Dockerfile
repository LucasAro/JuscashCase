# Use a imagem Node.js como base
FROM node:18

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia apenas os arquivos necessários para instalar as dependências
COPY package.json package-lock.json ./

# Instala as dependências dentro do container
RUN npm install

# Copia o restante dos arquivos da aplicação
COPY . .

# Expõe a porta 5173 (para o Vite no React)
EXPOSE 5173

# Comando para rodar o servidor de desenvolvimento
CMD ["npm", "run", "dev"]
