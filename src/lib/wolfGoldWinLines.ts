/** Trecho premiado de uma payline (espelha `detalhes.linhas_vencedoras` da API). */
export type WolfGoldWinLine = {
  linha: number
  padrao: number[]
  contagem: number
}

export function winningCellMap(lines: WolfGoldWinLine[]): Map<string, number[]> {
  const map = new Map<string, number[]>()
  for (const w of lines) {
    const span = Math.min(w.contagem, w.padrao.length)
    for (let col = 0; col < span; col++) {
      const row = w.padrao[col]!
      const key = `${col}-${row}`
      const nums = map.get(key) ?? []
      if (!nums.includes(w.linha)) nums.push(w.linha)
      map.set(key, nums)
    }
  }
  return map
}

/** Pontos normalizados 0–100 para SVG overlay (centro de cada célula). */
export function paylinePolylinePoints(line: WolfGoldWinLine): string {
  const parts: string[] = []
  const span = Math.min(line.contagem, line.padrao.length)
  for (let col = 0; col < span; col++) {
    const row = line.padrao[col]!
    const x = ((col + 0.5) / 5) * 100
    const y = ((row + 0.5) / 3) * 100
    parts.push(`${x},${y}`)
  }
  return parts.join(' ')
}

export function formatWinLinesBanner(lines: WolfGoldWinLine[]): string | null {
  if (lines.length === 0) return null
  const nums = lines.map((l) => l.linha).sort((a, b) => a - b)
  const label = nums.length === 1 ? 'Linha' : 'Linhas'
  const plural = nums.length === 1 ? '' : 's'
  return `${label} ${nums.join(', ')} premiada${plural}`
}