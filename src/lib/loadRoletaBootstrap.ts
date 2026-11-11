import { fetchRoletaGameDetail, normalizeRoletaConfig } from '../api/games'
import { fetchRoletaConfig } from '../api/roleta'
import type { GamePlayMeta } from '../types/playhub'
import type { RoletaConfig } from '../types/roleta'

export type RoletaBootstrap = {
  gameSlug: string
  play: GamePlayMeta
  config: RoletaConfig
  cardTitle: string
}

/**
 * Contrato §0: GET /api/v1/games/{slug}/ + fallback GET /api/v1/roleta/?mesa=
 */
export async function loadRoletaBootstrap(
  gameSlug: string,
  signal?: AbortSignal,
): Promise<RoletaBootstrap> {
  const detail = await fetchRoletaGameDetail(gameSlug, signal)
  const play = detail.play
  if (!play || play.kind !== 'roleta') {
    throw new Error('Este jogo não está vinculado à roleta.')
  }

  let config: RoletaConfig
  if (detail.roleta?.mesa) {
    config = normalizeRoletaConfig(detail.roleta)
    if (!config.historico_recente?.length) {
      const full = await fetchRoletaConfig(play.mesa_slug, signal)
      config = { ...config, historico_recente: full.historico_recente ?? [] }
    }
  } else {
    config = await fetchRoletaConfig(play.mesa_slug, signal)
  }

  return {
    gameSlug,
    play,
    config,
    cardTitle: detail.card.title,
  }
}
