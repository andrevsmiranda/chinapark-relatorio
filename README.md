# China Park — Relatório Gerencial Digital

Plataforma estática (HTML + JSON) com 24 meses de histórico (Mai/24 → Abr/26), filtros de período/comparação/canais e fluxo de upload pra adicionar novos meses.

## Estrutura

```
chinapark-relatorio/
├── index.html       ← app único, ~99 KB, libs via CDN
├── data/
│   ├── index.json   ← lista de meses disponíveis
│   ├── 2024-05.json
│   ├── ...          ← 24 meses
│   └── 2026-04.json
├── vercel.json      ← config de deploy
├── .gitignore
└── README.md
```

## Rodar localmente

O app usa `fetch()` pra carregar os JSONs — precisa de servidor HTTP, não funciona com `file://`.

```bash
# Na pasta do projeto:
python3 -m http.server 8000
# Abrir http://localhost:8000
```

## Deploy no Vercel — passo a passo

### 1. Criar repositório no GitHub

1. Acesse https://github.com/new
2. Nome: `chinapark-relatorio` (privado ou público, sua escolha)
3. **Não** inicialize com README/gitignore (já estão na pasta)
4. Clique em "Create repository"

### 2. Subir os arquivos

No editor web do GitHub (mais fácil — não precisa de terminal):

1. Na página do repo recém-criado, clique em **"uploading an existing file"**
2. Arraste **toda a pasta `chinapark-relatorio/`** pra área de upload
   - Importante: arrasta a pasta inteira, não os arquivos um por um
3. Mensagem do commit: "Initial commit — 24 meses"
4. Clique em **"Commit changes"**

### 3. Conectar com Vercel

1. Acesse https://vercel.com/new
2. Faça login com GitHub
3. Selecione o repo `chinapark-relatorio`
4. Framework Preset: **Other**
5. Build Command: **deixe vazio**
6. Output Directory: **deixe vazio** (pasta raiz)
7. Clique em **Deploy**

Em ~30 segundos o app fica no ar em `chinapark-relatorio.vercel.app`.

### 4. (Opcional) Domínio próprio

No Vercel → Settings → Domains, adicione `relatorio.chinapark.com.br`:
1. Vercel mostra um CNAME pra adicionar no DNS da Locaweb/Registro
2. Adiciona o CNAME → aguarda propagação (~10 min)
3. SSL automático

## Adicionar novo mês

1. Abra o app, clique em **"Adicionar mês"**
2. Suba os 4 arquivos (Silbeck Ocupação + Origens + DRE + Omnibees) + opcionalmente o PDF do mesmo mês no ano anterior
3. Clique em **Gerar JSON** — baixa `AAAA-MM.json`
4. No GitHub:
   - Vá em `data/`
   - "Add file → Upload files" → arrasta o JSON
   - Edite `data/index.json` adicionando `"AAAA-MM"` na lista
   - Commit
5. Vercel re-deploya automaticamente em segundos

## Filtros disponíveis

- **Período**: troca o mês exibido
- **Comparar com**: YoY (ano anterior) / Mês anterior / Sem comparação
- **Top N Cidades**: 10 / 20 / 30
- **Canais**: Todos / Só online / Só offline

## Status dos dados

- **Mar/26 e Abr/26** (2 meses): dados completos
- **Mai/24 → Fev/26** (22 meses): dados parciais — só faturamento/ocupação/ADR/RevPAR/estados/cidades (formato antigo do Silbeck não exportava canais/segmento/permanência)

Quando os XLS antigos forem re-exportados do Silbeck com filtro "Todas as seções", basta substituir os JSONs e remover a flag `dados_parciais`.
