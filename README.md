# China Park — Relatório Gerencial Digital

Plataforma estática com login + notificação no Slack a cada acesso. 24 meses de histórico, filtros, dashboard.

## Setup (1ª vez)

### 1. Criar webhook do Slack

1. Vá em https://api.slack.com/apps → **Create New App** → "From scratch"
2. Nome: "China Park Acessos" · selecione o workspace
3. No menu lateral: **Incoming Webhooks** → ativa o toggle
4. **Add New Webhook to Workspace** → seleciona o canal (ou DM com você mesmo) → **Allow**
5. Copia a URL do webhook (formato `https://hooks.slack.com/services/T.../B.../...`)

### 2. Configurar env vars no Vercel

Vai em Vercel → projeto `chinapark-relatorio` → **Settings → Environment Variables** e adiciona 3 variáveis:

| Nome | Valor | Onde |
|---|---|---|
| `APP_PASSWORD` | escolha uma senha forte | Production |
| `SESSION_SECRET` | string aleatória, 32+ chars | Production |
| `SLACK_WEBHOOK_URL` | URL do webhook do passo 1 | Production |

Pra gerar SESSION_SECRET: <https://www.uuidgenerator.net/> ou no terminal: `openssl rand -base64 32`

### 3. Redeploy

Após adicionar as env vars, **Deployments → último → ⋯ → Redeploy** pra elas serem aplicadas.

## Como usar

- Acessa `chinapark-relatorio.vercel.app` → tela de login
- Senha = valor de `APP_PASSWORD`
- Sessão dura 30 dias (cookie HttpOnly)
- Cada login dispara mensagem no Slack com: hora, IP, cidade, navegador
- Botão "Sair" no header faz logout

## Estrutura

```
chinapark-relatorio/
├── index.html              ← app principal
├── login.html              ← tela de login
├── middleware.js           ← protege rotas via cookie
├── api/
│   ├── login.js            ← POST /api/login → seta cookie + Slack
│   └── logout.js           ← GET /api/logout → limpa cookie
├── data/
│   ├── index.json
│   └── 2024-05.json … 2026-04.json (24 meses)
├── vercel.json
├── package.json
└── README.md
```

## Adicionar novo mês

1. Abra o app, clique em **"Adicionar mês"** no header
2. Suba os 4 arquivos do Silbeck/Omnibees + (opcional) PDF do mesmo mês no ano anterior
3. Clique em **Gerar JSON** — baixa `AAAA-MM.json`
4. No GitHub do repo:
   - Vá em `data/`
   - Add file → Upload files → arrasta o JSON
   - Edite `data/index.json` adicionando `"AAAA-MM"` à lista
   - Commit
5. Vercel re-deploya em ~30s

## Trocar a senha

1. Vercel → Settings → Environment Variables
2. Edita `APP_PASSWORD` com a nova senha
3. Redeploy
4. Todas as sessões ativas continuam válidas até expirarem (30 dias). Pra invalidar tudo, também troca `SESSION_SECRET`.
