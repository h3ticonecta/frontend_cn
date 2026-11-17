import { fetchCandyCascadeGameDetail, normalizeCandyCascadeConfig } from '../api/games'
import { fetchCandyCascadeConfig } from '../api/candyCascade'
import type { CandyCascadeConfig } from '../types/candyCascade'
import type { GamePlayMetaSlot } from '../types/playhub'

export type CandyCascadeBootstrap = {
  gameSlug: string
  play: GamePlayMetaSlot
  config: CandyCascadeConfig
  cardTitle: string
}

export async function loadCandyCascadeBootstrap(
  gameSlug: string,
  signal?: AbortSignal,
): Promise<CandyCascadeBootstrap> {
  const detail = await fetchCandyCascadeGameDetail(gameSlug, signal)
  const play =
    detail.play?.kind === 'slot'
      ? detail.play
      : detail.card.play?.kind === 'slot'
        ? detail.card.play
        : null
  if (!play) {
    throw new Error('Este jogo não está vinculado ao slot Candy Cascade.')
  }

  let config: CandyCascadeConfig
  if (detail.slot?.jogo) {
    config = normalizeCandyCascadeConfig(detail.slot)
    if (!config.historico_recente?.length) {
      const full = await fetchCandyCascadeConfig(play.slot_slug, signal)
      config = { ...config, historico_recente: full.historico_recente ?? [] }
    }
  } else {
    config = await fetchCandyCascadeConfig(play.slot_slug, signal)
  }

  return {
    gameSlug,
    play,
    config,
    cardTitle: detail.card.title,
  }
}