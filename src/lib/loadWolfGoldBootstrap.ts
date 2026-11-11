import { fetchWolfGoldGameDetail, normalizeWolfGoldConfig } from '../api/games'
import { fetchWolfGoldConfig } from '../api/wolfGold'
import type { GamePlayMetaSlot } from '../types/playhub'
import type { WolfGoldConfig } from '../types/wolfGold'

export type WolfGoldBootstrap = {
  gameSlug: string
  play: GamePlayMetaSlot
  config: WolfGoldConfig
  cardTitle: string
}

export async function loadWolfGoldBootstrap(
  gameSlug: string,
  signal?: AbortSignal,
): Promise<WolfGoldBootstrap> {
  const detail = await fetchWolfGoldGameDetail(gameSlug, signal)
  const play = detail.play
  if (!play || play.kind !== 'slot') {
    throw new Error('Este jogo não está vinculado a um slot jogável.')
  }
  if (play.slot_slug !== 'wolf-gold' && gameSlug !== 'wolf-gold') {
    throw new Error('Este card não corresponde ao Wolf Gold.')
  }

  let config: WolfGoldConfig
  if (detail.slot?.jogo) {
    config = normalizeWolfGoldConfig(detail.slot)
    if (!config.historico_recente?.length) {
      const full = await fetchWolfGoldConfig(play.slot_slug, signal)
      config = { ...config, historico_recente: full.historico_recente ?? [] }
    }
  } else {
    config = await fetchWolfGoldConfig(play.slot_slug, signal)
  }

  return { gameSlug, play, config, cardTitle: detail.card.title }
}
