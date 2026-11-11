# Google Stitch MCP

## Configurar no Cursor

1. **Cursor Settings** → **MCP** → **Add custom server**  
   Ou copie `.cursor/mcp.json.example` para `.cursor/mcp.json` (não commite a chave).

2. Use sua API key no header `X-Goog-Api-Key` (ou variável de ambiente, se o Cursor suportar no seu build).

3. Reinicie o Cursor / reconecte o MCP.

4. No chat do agente: peça para listar projetos/telas Stitch e exportar o HTML da tela **Roleta** para refinar o CSS.

> **Segurança:** nunca commite chaves de API no Git. Se uma chave vazou no chat, gere outra no Google Cloud.

## Design tokens (estúdio Roleta)

O layout da página `#/roleta` segue tokens inspirados em UI de casino premium (feltro, dourado, vidro):

| Token | Valor |
|-------|--------|
| felt | `#0a2920` |
| felt-light | `#134e3a` |
| gold | `#d4af37` |
| gold-soft | `#f5d76e` |
| glass | `rgba(15, 23, 42, 0.72)` |

Arquivo: `src/styles/roleta-studio.css`
