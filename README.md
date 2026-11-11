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

1. No serviço do **frontend**, em **Variables**, crie `VITE_API_URL` = URL do backend (ex. `https://…up.railway.app`).
2. **Importante:** o Vite lê `VITE_*` só no **build**. Depois de criar ou mudar a variável, dispare um **novo deploy** (rebuild).
3. No **Django**, configure **CORS** (e `CSRF_TRUSTED_ORIGINS` se usar sessão) para `https://frontendcn-dev.up.railway.app` (ou o domínio do seu frontend).

Sem `VITE_API_URL`, o browser chama `https://seu-frontend/api/...`, o host estático devolve `index.html` e aparece o erro *Unexpected token '&lt;'… is not valid JSON*.

Edite jogos, promoções e ao vivo no **Django Admin** (`/admin/`); o frontend reflete na próxima carga.

## Roleta (demo)

- Lobby: card **Roleta Brasil** → `#/roleta`
- API: contrato em `../backend_cn/docs/contratos/roleta.md`
- Sessão demo salva em `localStorage` (`playhub_roleta_sessao_id`)
