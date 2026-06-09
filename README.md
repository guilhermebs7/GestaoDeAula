# 📚 Sistema de Gerenciamento de Planos de Aula

> Plataforma centralizada para planejamento pedagógico com suporte a Inteligência Artificial via **Google Gemini**.



---

## Sobre o Projeto

O **Sistema de Gerenciamento de Planos de Aula** é uma aplicação full-stack desenvolvida para apoiar docentes e conteudistas no planejamento pedagógico. Além do gerenciamento tradicional (CRUD), a plataforma conta com o **Smart Assist**, um assistente inteligente powered by **Google Gemini** que sugere conteúdos complementares, tópicos relacionados e tags automaticamente com base nas informações da aula.

---

## Funcionalidades

**Gestão de Planos de Aula (CRUD)**
- Cadastro, edição, visualização e exclusão de planos de aula
- Campos: Título, Objetivo, Ementa/Resumo, Data Prevista, Disciplina, Conteúdos, Recursos de Apoio e Tags
- Listagem paginada com ordenação por Título ou Data de Cadastro

**Filtros e Busca**
- Filtro por Disciplina, Tags e Data Prevista
- Busca por Título da Aula

**Smart Assist — IA com Google Gemini**
- Geração automática de sugestões de conteúdos complementares
- Recomendação de tópicos relacionados
- Sugestão de 3 tags relevantes para a aula
- Preenchimento automático dos campos no formulário

**DevOps & Observabilidade**
- Logs estruturados nas operações principais e nas chamadas à IA
- Endpoint `/health` para verificação de saúde da aplicação
- Containerização completa com Docker e Docker Compose

---

## Tecnologias Utilizadas

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React (SPA) |
| Backend | Node.js + Express |
| Banco de Dados | PostgreSQL |
| IA | Google Gemini API |
| Containerização | Docker + Docker Compose |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        Docker Compose                        │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │    │   Backend    │    │  PostgreSQL  │  │
│  │    React     │───▶│  Node.js +   │───▶│              │  │
│  │   (porta     │    │   Express    │    │  (porta      │  │
│  │    3000)     │    │  (porta 3001)│    │   5432)      │  │
│  └──────────────┘    └──────┬───────┘    └──────────────┘  │
│                             │                               │
│                             ▼                               │
│                    ┌────────────────┐                       │
│                    │  Google Gemini │                       │
│                    │      API       │                       │
│                    └────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Pré-requisitos

- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) instalados
- Uma chave de API válida do [Google Gemini](https://aistudio.google.com/app/apikey)

---

## Como Executar

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha os valores (veja a seção [Variáveis de Ambiente](#variáveis-de-ambiente)).

### 3. Suba a aplicação

```bash
docker compose up --build
```

A aplicação estará disponível em:

- **Frontend:** http://localhost:3000
- **Backend (API):** http://localhost:3001
- **Health Check:** http://localhost:3001/health

> Para rodar em background, adicione a flag `-d`: `docker compose up --build -d`

### 4. Para encerrar

```bash
docker compose down
```

Para remover também os volumes (banco de dados):

```bash
docker compose down -v
```

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
PORT=3000
DATABASE_URL="postgresql://USER:SENHA@localhost:5432/lesson_planner"
GEMINI_API_KEY=your_gemini_api_key_here
```

> **⚠️ Atenção:** Nunca commite o arquivo `.env` com chaves reais. O arquivo já está incluído no `.gitignore`.

---

## Endpoints da API

### Planos de Aula

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/planos` | Lista todos os planos (paginado, com filtros) |
| `GET` | `/api/planos/:id` | Retorna um plano específico |
| `POST` | `/api/planos` | Cria um novo plano |
| `PUT` | `/api/planos/:id` | Atualiza um plano existente |
| `DELETE` | `/api/planos/:id` | Remove um plano |

### Parâmetros de Listagem (`GET /api/planos`)

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `page` | number | Página atual (padrão: 1) |
| `limit` | number | Itens por página (padrão: 10) |
| `titulo` | string | Busca por título |
| `disciplina` | string | Filtro por disciplina |
| `tags` | string | Filtro por tags |
| `dataInicio` | date | Filtro de data inicial |
| `dataFim` | date | Filtro de data final |
| `ordenarPor` | string | `titulo` ou `createdAt` |
| `ordem` | string | `asc` ou `desc` |

### Smart Assist

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/ai/recomendacoes` | Gera recomendações com IA |

**Body da requisição:**
```json
{
  "titulo": "Introdução ao OSPF",
  "disciplina": "Redes de Computadores",
  "ementa": "Conceitos básicos de roteamento dinâmico com protocolo OSPF"
}
```

**Resposta:**
```json
{
  "conteudos": ["Roteamento dinâmico vs estático", "Algoritmo de Dijkstra", "Áreas OSPF"],
  "topicosRelacionados": ["BGP", "EIGRP", "RIP v2", "Tabelas de roteamento"],
  "tags": ["redes", "roteamento", "ospf"]
}
```

### Health Check

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Verifica o status da aplicação e do banco |

**Resposta:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

## Smart Assist (IA)

O **Smart Assist** utiliza a API do **Google Gemini** com um prompt de *Prompt Engineering* otimizado para atuar como um **Assistente Pedagógico**. O backend instrui o modelo a responder exclusivamente em JSON estruturado, garantindo que o frontend possa preencher os campos automaticamente sem ambiguidades.

**Exemplo de log gerado:**
```
[INFO] AI Request: Title="Introdução ao OSPF", Discipline="Redes", TokenUsage=180, Latency=1.4s
```

O frontend exibe um **indicador de loading** enquanto aguarda a resposta da IA e trata erros de timeout ou falha na API com mensagens amigáveis ao usuário.

---



## Docker

O projeto é totalmente containerizado. A estrutura inclui:

```
├── docker-compose.yml       # Orquestra os serviços (frontend, backend, db)
├── backend/
│   └── Dockerfile
└── frontend/
    └── Dockerfile
```

**Serviços no Docker Compose:**

| Serviço | Imagem | Porta |
|---------|--------|-------|
| `frontend` | Node (build React) | 3000 |
| `backend` | Node.js | 3001 |
| `db` | postgres:15 | 5432 |

**Subir tudo com um único comando:**

```bash
docker compose up --build
```

---


## Estrutura do Projeto

```
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── database/
│   │   ├── models/
│   │   └── app.js
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── utils/
│   │   ├── services/
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

video da aplicação: https://www.youtube.com/watch?v=LtXC6rN-XCA
