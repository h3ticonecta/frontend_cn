import { formatChancesTooltip } from '../lib/chances'
import type { Chances } from '../types/chances'
import './ChancesDemoHint.css'

type Props = {
  chances: Chances
  className?: string
}

/** Badge opcional — leitura do config; o cliente não envia percentuais nos giros. */
export function ChancesDemoHint({ chances, className }: Props) {
  return (
    <span
      className={className ? `chances-demo-hint ${className}` : 'chances-demo-hint'}
      title={formatChancesTooltip(chances)}
    >
      Chances demo
    </span>
  )
}