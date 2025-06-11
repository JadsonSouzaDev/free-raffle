# ETL de Migração de Dados

Este projeto é uma aplicação ETL (Extract, Transform, Load) desenvolvida em Node.js para migrar dados entre diferentes bases de dados, realizando as transformações necessárias durante o processo.

## Requisitos

- Node.js (versão 18 ou superior)
- NPM ou Yarn
- Bancos de dados de origem e destino configurados

## Configuração

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Configurações do banco de dados de origem
SOURCE_DB_CLIENT=mysql2
SOURCE_DB_HOST=localhost
SOURCE_DB_USER=user
SOURCE_DB_PASSWORD=password
SOURCE_DB_NAME=source_database
SOURCE_DB_PORT=3306

# Configurações do banco de dados de destino
TARGET_DB_CLIENT=postgresql
TARGET_DB_HOST=localhost
TARGET_DB_USER=user
TARGET_DB_PASSWORD=password
TARGET_DB_NAME=target_database
TARGET_DB_PORT=5432
```

## Estrutura do Projeto

```
.
├── src/
│   ├── config/
│   │   └── database.js
│   └── index.js
├── logs/
├── package.json
└── README.md
```

## Como Usar

1. Configure as variáveis de ambiente no arquivo `.env`
2. Ajuste as funções de transformação em `src/index.js` de acordo com suas necessidades
3. Execute o ETL:

```bash
npm start
```

Para desenvolvimento:
```bash
npm run dev
```

## Logs

Os logs são salvos no diretório `logs/`:
- `error.log`: Contém apenas os logs de erro
- `combined.log`: Contém todos os logs do sistema

## Personalização

Para personalizar as transformações, edite as funções no arquivo `src/index.js`:

- `extract()`: Define a lógica de extração dos dados
- `transform()`: Define as transformações a serem aplicadas
- `load()`: Define como os dados serão carregados no destino 