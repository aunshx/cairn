const TRAILING = new Set(['description', 'solutions', 'editorial', 'submissions', 'discuss', ''])

const ROMAN = new Set(['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'])

const LOWERCASE = new Set(['a', 'an', 'and', 'of', 'the', 'to', 'in', 'with', 'for', 'or'])

export type ParsedProblem = {
  name: string
  url?: string
}

function deslug(slug: string): string {
  const words = slug
    .replace(/[_+]/g, '-')
    .split('-')
    .filter(Boolean)

  if (words.length === 0) return ''

  return words
    .map((word, i) => {
      const lower = word.toLowerCase()
      if (ROMAN.has(lower)) return lower.toUpperCase()
      if (i > 0 && LOWERCASE.has(lower)) return lower
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(' ')
}

export function parseProblemInput(raw: string): ParsedProblem {
  const trimmed = raw.trim()
  if (trimmed === '') return { name: '' }
  if (!/^https?:\/\//i.test(trimmed)) return { name: trimmed }

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return { name: trimmed }
  }

  const segments = url.pathname.split('/').filter((s) => s !== '')
  const anchor = segments.indexOf('problems')

  let slug = ''
  if (anchor >= 0 && segments[anchor + 1]) {
    slug = segments[anchor + 1] ?? ''
  } else {
    for (let i = segments.length - 1; i >= 0; i -= 1) {
      const candidate = segments[i] ?? ''
      if (!TRAILING.has(candidate.toLowerCase())) {
        slug = candidate
        break
      }
    }
  }

  const name = deslug(slug)
  if (name === '') return { name: url.hostname, url: trimmed }
  return { name, url: trimmed }
}
