import type { Chances } from '../types/chances'
import { DEFAULT_CHANCES } from '../types/chances'

export function withDefaultChances(chances: Chances | undefined): Chances {
  return chances ?? DEFAULT_CHANCES
}

/** Tooltip informativo — não é promessa regulatória de RTP. */
export function formatChancesTooltip(chances: Chances): string {
  return `Chances demo (por giro pago): casa ${chances.percentual_casa}% · jogador ${chances.percentual_usuario}%. Não é RTP garantido.`
}