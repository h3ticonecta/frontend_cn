/** Sequência física da roleta europeia (sentido horário, começando no 0 no topo). */
export const EUROPEAN_WHEEL_ORDER: readonly number[] = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
]

export const WHEEL_SLOT_ANGLE = 360 / EUROPEAN_WHEEL_ORDER.length

export function pocketCenterAngle(index: number): number {
  return -90 + index * WHEEL_SLOT_ANGLE + WHEEL_SLOT_ANGLE / 2
}

export function indexOfPocket(numero: number): number {
  const idx = EUROPEAN_WHEEL_ORDER.indexOf(numero)
  return idx >= 0 ? idx : 0
}

/** Rotação final da roda: o bolso vencedor para na posição da bolinha (ângulo dado). */
export function wheelRotationToLand(
  currentWheel: number,
  numero: number,
  ballWorldAngle: number,
  extraTurns = 5,
): number {
  const idx = indexOfPocket(numero)
  const pocketLocal = pocketCenterAngle(idx)
  const targetWheelMod = ballWorldAngle - pocketLocal
  const currentMod = ((currentWheel % 360) + 360) % 360
  let delta = targetWheelMod - currentMod
  while (delta <= 0) delta += 360
  return currentWheel + delta + extraTurns * 360
}

/** Bolinha acompanha o bolso vencedor no trilho (ângulo mundial alinhado). */
export function ballRotationToLand(
  currentBall: number,
  targetWheel: number,
  numero: number,
  extraTurns = 9,
): number {
  const idx = indexOfPocket(numero)
  const align = pocketCenterAngle(idx) + targetWheel
  const currentMod = ((currentBall % 360) + 360) % 360
  const targetMod = ((align % 360) + 360) % 360
  let delta = targetMod - currentMod
  while (delta <= 0) delta += 360
  return currentBall + delta + extraTurns * 360
}

export function pocketFill(
  numero: number,
  vermelhos: number[],
): 'green' | 'red' | 'black' {
  if (numero === 0) return 'green'
  return vermelhos.includes(numero) ? 'red' : 'black'
}
