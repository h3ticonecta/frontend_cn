import type { CandyCascadePasso } from '../types/candyCascade'
import { isPassoGanho } from '../types/candyCascade'

/** Células que participaram de algum cluster vencedor no giro. */
export function winningCellsFromCascatas(cascatas: CandyCascadePasso[]): Set<string> {
  const set = new Set<string>()
  for (const passo of cascatas) {
    if (!isPassoGanho(passo)) continue
    for (const g of passo.ganhos) {
      for (const [c, r] of g.celulas) {
        set.add(`${c}-${r}`)
      }
    }
  }
  return set
}

export function summarizeCascatas(cascatas: CandyCascadePasso[]): string[] {
  const lines: string[] = []
  let step = 0
  for (const passo of cascatas) {
    if (isPassoGanho(passo)) {
      step += 1
      const detalhe = passo.ganhos.map((g) => `${g.contagem}× ${g.simbolo}`).join(', ')
      lines.push(`Cascata ${step}: ${detalhe} → ${passo.premio_parcial}`)
    } else if ('evento' in passo) {
      if (passo.evento === 'pagamento_scatter') {
        lines.push(`Scatter (${passo.scatters}): +${passo.premio_parcial}`)
      } else if (passo.evento === 'multiplicadores_aplicados') {
        lines.push(`Multiplicador ×${passo.fator}: ${passo.premio_antes} → ${passo.premio_depois}`)
      } else if (passo.evento === 'teto_maximo') {
        lines.push(`Teto máximo: ${passo.teto}`)
      }
    }
  }
  return lines
}