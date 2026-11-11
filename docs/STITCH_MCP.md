# Google Stitch MCP

## Configurar no Cursor

1. **Cursor Settings** → **MCP** → **Add custom server**  
   Ou copie `.cursor/mcp.json.example` para `.cursor/mcp.json` (não commite a chave).

2. Use sua API key no header `X-Goog-Api-Key` (ou variável de ambiente, se o Cursor suportar no seu build).

3. Reinicie o Cursor / reconecte o MCP.

4. No chat do agente: peça para listar projetos/telas Stitch e exportar o HTML da tela **Roleta** para refinar o CSS.

> **Segurança:** nunca commite chaves de API no Git. Se uma chave vazou no chat, gere outra no Google Cloud.

## Design system (Roleta)

Tokens extraídos do layout Stitch (paleta navy + dourado + mesa europeia):

| Token | Valor |
|-------|--------|
| background | `#0b121f` |
| surface | `#0f172a` |
| gold (CTA) | `#facc15` → `#eab308` |
| red | `#d61c22` |
| green | `#008445` |
| text muted | `#94a3b8` |

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
