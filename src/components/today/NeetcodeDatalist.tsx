import { NEETCODE_250 } from '../../lib/neetcode'

export const NEETCODE_LIST_ID = 'neetcode-250'

export function NeetcodeDatalist() {
  return (
    <datalist id={NEETCODE_LIST_ID}>
      {NEETCODE_250.map((problem) => (
        <option key={problem.name} value={problem.name}>
          {problem.category} · {problem.difficulty}
        </option>
      ))}
    </datalist>
  )
}
