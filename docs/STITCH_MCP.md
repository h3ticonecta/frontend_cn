# Google Stitch MCP

## Configurar no Cursor

1. **Cursor Settings** → **MCP** → **Add custom server**  
   Ou copie `.cursor/mcp.json.example` para `.cursor/mcp.json` (não commite a chave).

2. Use sua API key no header `X-Goog-Api-Key` (ou variável de ambiente, se o Cursor suportar no seu build).

3. Reinicie o Cursor / reconecte o MCP.

4. No chat do agente: peça para listar projetos/telas Stitch e exportar o HTML da tela **Roleta** para refinar o CSS.

> **Segurança:** nunca commite chaves de API no Git. Se uma chave vazou no chat, gere outra no Google Cloud.

## Design system (Roleta)

Projeto Stitch: **Roleta Europeia Animada** (`1356737128262033879`), tela **Roleta Europeia VIP - Salon Privé**.

Design system **Monte Carlo Grand Royale** (sincronizado via MCP):

| Token | Valor |
|-------|--------|
| background / surface | `#1b110e` |
| primary | `#f2ca50` |
| primary-container | `#d4af37` |
| on-surface | `#f3ded8` |
| felt (mesa) | `#0b3020` |
| roulette red | `#c92a2a` |
| roulette green | `#15803d` |
| roulette black | `#1e1e1e` |

Tipografia: **Playfair Display** (títulos) + **Plus Jakarta Sans** (UI / grade).

Metadados: `docs/stitch-roleta-sync.json`

Arquivos:

- `src/styles/stitch-roleta-tokens.css` — variáveis `--stitch-*`
- `src/styles/roleta-studio.css` — aplicação na página
- `src/pages/RoletaPage.css` — layout Apostas (roda + grade + ações)

### Sincronizar com o MCP

1. **Settings → MCP** — servidor `stitch` conectado (`.cursor/mcp.json`).
2. `list_projects` → `list_screens` → `get_screen` na tela **Roleta**.
3. Baixe o HTML: `bash scripts/fetch-stitch.sh "<htmlCode.downloadUrl>" ".stitch/designs/roleta.html"`.
4. Extraia `<script id="tailwind-config">` e compare com `stitch-roleta-tokens.css`.
5. Peça ao agente para atualizar tokens/layout se houver diff.

Pasta local sugerida: `.stitch/designs/` (não commitar exports grandes).
