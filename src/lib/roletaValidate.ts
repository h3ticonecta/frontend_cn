import type { RoletaMesa } from '../types/roleta'

export function formatApostaValor(raw: string): string {
  const n = Number(raw.replace(',', '.'))
  if (!Number.isFinite(n)) return ''
  return n.toFixed(2)
}

export function valorApostaValido(
  valorStr: string,
  mesa: RoletaMesa,
): { ok: true; valor: string } | { ok: false; motivo: string } {
  const valor = formatApostaValor(valorStr)
  const n = Number(valor)
  const min = Number(mesa.aposta_minima)
  const max = Number(mesa.aposta_maxima)

  if (!valor || n <= 0) {
    return { ok: false, motivo: 'Valor de aposta inválido.' }
  }
  if (n < min) {
    return { ok: false, motivo: `Aposta mínima: ${mesa.aposta_minima} fichas.` }
  }
  if (n > max) {
    return { ok: false, motivo: `Aposta máxima: ${mesa.aposta_maxima} fichas.` }
  }
  return { ok: true, valor }
}

export function podeAdicionarAposta(
  quantidadeAtual: number,
  maxPorGiro: number,
): string | null {
  if (quantidadeAtual >= maxPorGiro) {
    return `Máximo de ${maxPorGiro} apostas por giro.`
  }
  return null
}

export function somaApostas(valores: string[]): number {
  return valores.reduce((acc, v) => acc + Number(v), 0)
}
