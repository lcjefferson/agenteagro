# AgenteAgro 🤖🌱

Sistema de Agente de IA integrado ao WhatsApp para diagnóstico preliminar de pragas e doenças em plantas e animais.

## 🚀 Funcionalidades

- **Integração WhatsApp**: Recebimento de mensagens e imagens.
- **Inteligência Artificial**:
  - NLP (GPT) para interpretação de textos.
  - Visão Computacional (Placeholder) para análise de imagens.
- **Geolocalização**: Busca de veterinários e agrônomos próximos.
- **Dashboard Administrativo**:
  - Métricas de atendimento.
  - Histórico de conversas.
  - Configuração do Agente (Prompt System).

## 🛠 Tecnologias

- **Backend**: Python (FastAPI), SQLAlchemy, PostgreSQL (ou SQLite para dev).
- **Frontend**: React, Vite, Tailwind CSS, Recharts.
- **Infraestrutura**: Docker Compose.

## 📦 Como Rodar

### Pré-requisitos
- Docker e Docker Compose
- Node.js 18+
- Python 3.9+

### 1. Configuração do Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Crie um arquivo `.env` em `backend/` (opcional, defaults em `config.py`):
```env
DATABASE_URL=sqlite+aiosqlite:///./agenteagro.db
OPENAI_API_KEY=sk-...
```

Rodar o servidor:
```bash
uvicorn app.main:app --reload
```
Acesse a documentação da API em: `http://localhost:8000/docs`

### 2. Configuração do Frontend

```bash
cd frontend
npm install
npm run dev
```
Acesse o dashboard em: `http://localhost:5173`

### 3. Rodando com Docker (Recomendado para Produção)

```bash
docker-compose up --build
```

## 🧪 Testes

Backend:
```bash
cd backend
pytest
```

## 📝 Estrutura do Projeto

- `backend/app`: Código fonte da API.
- `frontend/src`: Código fonte do Dashboard.
- `docker-compose.yml`: Orquestração dos serviços.
