# PlayHub — Jogos Online

Landing page de jogos online inspirada no layout de casinos (tema escuro, detalhes dourados, grade de jogos, promoções e faixa ao vivo).

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra a URL exibida no terminal (geralmente `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Roleta (API)

Jogo demo em `#/roleta` (atalho pelo card **Roleta Brasil**). Fluxo:

1. `GET /api/v1/roleta/?mesa=roleta-brasil` — limites, tipos e histórico  
2. `POST /api/v1/roleta/sessoes/` — sessão com saldo demo (persistida em `localStorage`)  
3. `POST /api/v1/roleta/girar/` — apostas + sorteio atômico  

Em dev, o Vite faz proxy de `/api` para `http://127.0.0.1:8000` (Django). Rode o backend e `python manage.py seed_roleta`.

Variável opcional: `VITE_API_URL` (produção).

> **Nota:** Fichas virtuais apenas — sem dinheiro real.

## API (backend Django)

A landing consome `GET /api/v1/home/` do repositório `backend_cn`.

1. Suba o backend: `python manage.py runserver` (porta 8000).
2. Suba o frontend: `npm run dev`.

Em desenvolvimento o Vite faz **proxy** de `/api` → `http://127.0.0.1:8000` (mesma origem, sem CORS). `.env.development` mantém `VITE_API_URL` vazio.

Em produção, aponte `VITE_API_URL` para o host **público** do Django (sem `/` no final).

### Deploy no Railway (frontend)

1. No **backend**, em **Settings → Networking**, copie o domínio **público** (termina em `.up.railway.app`).
2. No **frontend** → **Variables**: `VITE_API_URL` = `https://SEU-DOMINIO-PUBLICO.up.railway.app` (com `https://`, sem `/` no final).
3. **Não use** `*.railway.internal` — isso só funciona entre containers no Railway; o browser do usuário não alcança esse host.
4. **Redeploy** do frontend após mudar `VITE_*` (valor é embutido no build).
5. No **backend** (Railway → Variables):
   - `DJANGO_ALLOWED_HOSTS` = `backendcn-dev.up.railway.app`
   - `CORS_ALLOWED_ORIGINS` = `https://frontendcn-dev.up.railway.app`
   - `DJANGO_DEBUG` = `false`

Erro **400** com *API respondeu 400*: quase sempre **DisallowedHost** — o Django não reconhece o domínio público do backend.

Teste no navegador: `https://SEU-BACKEND.up.railway.app/api/v1/home/` deve retornar JSON.

Edite jogos, promoções e ao vivo no **Django Admin** (`/admin/`); o frontend reflete na próxima carga.

## Roleta (demo)

- Lobby: card **Roleta Brasil** → `#/roleta`
- API: contrato em `../backend_cn/docs/contratos/roleta.md`
- Sessão demo salva em `localStorage` (`playhub_roleta_sessao_id`)
