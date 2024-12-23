# JusCash Case - Automação e Gerenciamento de Publicações no DJE

## Visão Geral

objetivo principal é criar um sistema para automação de scraping de publicações do Diário da Justiça Eletrônico (DJE) de São Paulo, gerenciamento via API, e uma interface de usuário para acompanhamento dessas publicações.

## Link para o Deploy na AWS, utilizando GitHub Actions
http://3.135.200.72:5173/

## Funcionalidades

### Backend
1. **Web Scraping Automático**: Extração diária de publicações do DJE, filtrando por "Caderno 3 - Judicial - 1ª Instância - Capital".
2. **Banco de Dados**: Armazenamento eficiente das publicações com status gerenciáveis.
3. **API RESTful**: Endpoints para gerenciar as publicações e integrar com o frontend.

### Frontend
1. **Tela de Login e Cadastro**: Sistema de autenticação seguro.
2. **Kanban**: Interface para visualizar e gerenciar o status das publicações.
3. **Busca e Filtro**: Localização de publicações por critérios diversos.
4. **Modal de Detalhes**: Exibição completa das informações das publicações.

## Tecnologias Utilizadas

### Backend
- **Python**: Web scraping e automação.
- **Node.js (Express)**: API RESTful.
- **PostgreSQL**: Banco de dados relacional.
- **Docker**: Contêinerização e orquestração.

### Frontend
- **React.js**: Interface de usuário.
- **CSS Responsivo**: Estilização adaptada para dispositivos móveis e desktop.

### Outros
- **Docker Compose**: Gerenciamento de múltiplos contêineres.
- **Crontab**: Automação do scraping diário.

## Pré-requisitos

- Docker e Docker Compose instalados.
- Acesso à rede para criação de contêineres.

## Passos para Execução Local

### Clonagem do Repositório
```bash
git clone https://github.com/LucasAro/JuscashCase.git
cd JuscashCase
```

### Backend

#### Build do Projeto
```bash
docker compose build
```

#### Subir o Projeto
```bash
docker compose up -d
```

#### Configurar Rede Compartilhada
```bash
docker network create network_scraper
docker network connect network_scraper meu_postgres
```

### Scraper (Python)

#### Acessar Diretório do Scraper
```bash
cd scraper
```

#### Configuração Inicial
- Modifique `DATA_INICIAL` em `config.py` ao rodar a primeira vez para buscar as informações de 19/11/2024 até o dia atual.
```python
DATA_INICIAL = f'dadosConsulta.dtInicio=19%2F11%2F2024&dadosConsulta.dtFim {data_atual}&dadosConsulta.cdCaderno=12&dadosConsulta.pesquisaLivre=%22RPV%22+e+%22pagamento+pelo+INSS%22&pagina='
```

#### Build do Contêiner
```bash
docker build -t python_scraper .
```

#### Automação com Crontab
- Edite o crontab:
```bash
crontab -e
```
- Adicione a linha para executar o scraper diariamente às 23h:
```bash
0 23 * * * docker run --network network_scraper python_scraper
```

#### Teste Manual
```bash
docker run --network network_scraper python_scraper
```

### Após rodar a primeira vez, lembre-se de  modificar `DATA_INICIAL` em `config.py`
## Em config.py
```python
DATA_INICIAL = f'dadosConsulta.dtInicio={data_atual}&dadosConsulta.dtFim={data_atual}&dadosConsulta.cdCaderno=12&dadosConsulta.pesquisaLivre=%22RPV%22+e+%22pagamento+pelo+INSS%22&pagina='
```
## Depois builde novamente o python_scraper
```bash
docker build -t python_scraper .
```

#### Build e Deploy
A configuração do frontend está integrada ao Docker Compose e será disponibilizada automaticamente ao subir o projeto.
- o Front End em React estará rodando em: http://localhost:5173
- o Back End em Express estará rodando em: http://localhost:3000
- O Bando de Dados em Postgres estará rodando em http://localhost:5432

## Estrutura do Banco de Dados

### Tabela: documentos
```sql
CREATE TABLE public.documentos (
    id serial4 NOT NULL,
    arquivo text NULL,
    data_disponibilizacao date NULL,
    processo text NULL,
    autores text NULL,
    advogados text NULL,
    valor_principal_bruto_liquido numeric(15, 2) NULL,
    valor_juros_moratorios numeric(15, 2) NULL,
    valor_honorarios_advocaticios numeric(15, 2) NULL,
    paragrafo text NULL,
    reu text NULL,
    status text NULL,
    created_at timestamp DEFAULT now() NULL,
    updated_at timestamp DEFAULT now() NULL,
    CONSTRAINT documentos_pkey PRIMARY KEY (id)
);
```

### Tabela: users
```sql
CREATE TABLE public.users (
    id serial4 NOT NULL,
    nome varchar(100) NOT NULL,
    email varchar(255) NOT NULL,
    senha varchar(255) NOT NULL,
    created_at timestamp DEFAULT now() NULL,
    updated_at timestamp DEFAULT now() NULL,
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_pkey PRIMARY KEY (id)
);
```

## Documentação da API

A documentação completa dos endpoints da API está disponível no arquivo `documentacao_tecnica.pdf`.
Há uma documentação de rotas em http://localhost:3000/api-docs/ que pode ser acessada após o sistema ser configurado

## Fluxo de Trabalho do Kanban
1. **Publicações Novas**: Publicações recém-extraídas.
2. **Publicações Lidas**: Revisadas, mas não enviadas para análise.
3. **Enviadas para ADV**: Enviadas para análise dos advogados.
4. **Concluídas**: Processamento finalizado.

- Os cards só podem ser movimentados para a coluna seguinte, seguindo um fluxo de sequência de projeto.
- A movimentação para trás só é permitida da coluna "Enviado para ADV" para a coluna "Publicação Lida".


## Licença
Este projeto está licenciado sob os termos da [MIT License](LICENSE).
