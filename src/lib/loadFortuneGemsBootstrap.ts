import { fetchFortuneGemsGameDetail, normalizeFortuneGemsConfig } from '../api/games'
import { fetchFortuneGemsConfig } from '../api/fortuneGems'
import type { GamePlayMetaSlot } from '../types/playhub'
import type { FortuneGemsConfig } from '../types/fortuneGems'

export type FortuneGemsBootstrap = {
  gameSlug: string
  play: GamePlayMetaSlot
  config: FortuneGemsConfig
  cardTitle: string
}

export async function loadFortuneGemsBootstrap(
  gameSlug: string,
  signal?: AbortSignal,
): Promise<FortuneGemsBootstrap> {
  const detail = await fetchFortuneGemsGameDetail(gameSlug, signal)
  const play = detail.play
  if (!play || play.kind !== 'slot') {
    throw new Error('Este jogo não está vinculado ao slot Fortune Gems.')
  }

  let config: FortuneGemsConfig
  if (detail.slot?.jogo) {
    config = normalizeFortuneGemsConfig(detail.slot)
    if (!config.historico_recente?.length) {
      const full = await fetchFortuneGemsConfig(play.slot_slug, signal)
      config = { ...config, historico_recente: full.historico_recente ?? [] }
    }
  } else {
    config = await fetchFortuneGemsConfig(play.slot_slug, signal)
  }

  return {
    gameSlug,
    play,
    config,
    cardTitle: detail.card.title,
  }
}
