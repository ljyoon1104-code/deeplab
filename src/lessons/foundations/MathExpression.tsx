import { createElement as element, type ReactNode } from 'react'

// A small, deterministic TeX-to-MathML reader for this course's authored formulas.
// Native MathML keeps fractions, scripts and operators semantic and zoomable.
const token = (tag: string, content: ReactNode, props: Record<string, unknown> = {}) => element(tag, props, content)
const row = (children: ReactNode[]) => element('mrow', null, ...children)
const operator = (text: string) => token('mo', text)
const commands: Record<string, string> = {
  partial: '∂', sigma: 'σ', eta: 'η', theta: 'θ', delta: 'δ', alpha: 'α',
  times: '×', cdot: '·', approx: '≈', ge: '≥', geq: '≥', le: '≤', leq: '≤',
  ne: '≠', neq: '≠', infty: '∞', in: '∈', to: '→', rightarrow: '→', leftarrow: '←',
  Delta: 'Δ', nabla: '∇', pm: '±', lbrace: '{', rbrace: '}', lvert: '|', rvert: '|',
}
function parseFormula(source: string): ReactNode {
  let position = 0
  const skip = () => { while (/\s/.test(source[position] ?? '') && position < source.length) position++ }
  function group(): ReactNode {
    skip()
    if (source[position] === '{') { position++; const content = sequence('}'); position++; return content }
    return atom()
  }
  function rawGroup(): string {
    skip()
    if (source[position] !== '{') return source[position++] ?? ''
    const start = ++position
    let depth = 1
    while (position < source.length && depth) {
      if (source[position] === '{') depth++
      if (source[position] === '}') depth--
      if (depth) position++
    }
    const content = source.slice(start, position)
    position++
    return content
  }
  function atom(): ReactNode {
    skip()
    const char = source[position++]
    if (!char) return row([])
    if (char === '{') { const content = sequence('}'); position++; return content }
    if (char === '(' || char === '[') {
      const closing = char === '(' ? ')' : ']'
      const content = sequence(closing)
      if (source[position] === closing) position++
      return row([operator(char), content, operator(closing)])
    }
    if (char === '\\') {
      const match = source.slice(position).match(/^[a-zA-Z]+/)
      const command = match?.[0] ?? source[position++]
      if (match) position += command.length
      if (command === 'frac' || command === 'dfrac' || command === 'tfrac') return element('mfrac', null, group(), group())
      if (command === 'hat' || command === 'bar' || command === 'overline') return element('mover', { accent: 'true' }, group(), operator(command === 'hat' ? '^' : '¯'))
      if (command === 'sqrt') return element('msqrt', null, group())
      if (command === 'mathrm' || command === 'operatorname') return token('mi', rawGroup(), { mathvariant: 'normal' })
      if (command === 'text') return token('mtext', rawGroup())
      if (command === 'sum') return operator('∑')
      if (command === 'prod') return operator('∏')
      if (['ln', 'log', 'exp', 'max', 'min'].includes(command)) return token('mi', command, { mathvariant: 'normal' })
      if (['left', 'right', 'displaystyle', 'limits'].includes(command)) return row([])
      if (['quad', 'qquad', ',', ';', '!', ' '].includes(command)) return element('mspace', { width: command === 'qquad' ? '1em' : command === '!' ? '0em' : '.3em' })
      if (command === 'begin') {
        const environment = rawGroup()
        const end = source.indexOf(`\\end{${environment}}`, position)
        if (environment !== 'cases' || end < 0) throw new Error(`Unsupported math environment: ${environment}`)
        const body = source.slice(position, end)
        position = end + `\\end{${environment}}`.length
        return row([operator('{'), element('mtable', { columnalign: 'left', style: { borderSpacing: '0.3em 0.2em' } }, ...body.split('\\\\').filter(line => line.trim()).map(line => element('mtr', null, ...line.split('&').map(cell => element('mtd', { style: { padding: '.2em .35em', textAlign: 'left' } }, parseFormula(cell))))))])
      }
      if (commands[command]) return /^(sigma|eta|theta|delta|alpha|Delta)$/.test(command) ? token('mi', commands[command]) : operator(commands[command])
      if (['{', '}', '|', '_', '%'].includes(command)) return operator(command)
      throw new Error(`Unsupported math command: \\${command}`)
    }
    const number = source.slice(position - 1).match(/^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i)
    if (number) {
      position += number[0].length - 1
      const scientific = number[0].split(/e/i)
      return scientific.length === 2 ? row([token('mn', scientific[0]), operator('×'), element('msup', null, token('mn', '10'), token('mn', scientific[1]))]) : token('mn', number[0])
    }
    if (/[a-zA-Zα-ωΑ-Ωŷ]/.test(char)) return token('mi', char)
    return operator(char === '-' ? '−' : char)
  }
  function sequence(stop?: string): ReactNode {
    const nodes: ReactNode[] = []
    while (position < source.length) {
      skip()
      if (position >= source.length || source[position] === stop) break
      let base = atom(), sub: ReactNode, sup: ReactNode
      skip()
      while (source[position] === '_' || source[position] === '^' || source[position] === "'") {
        const script = source[position++]
        if (script === '_') sub = group()
        else sup = script === "'" ? operator('′') : group()
        skip()
      }
      const isSum = typeof base === 'object' && base !== null && 'props' in base && (base.props as {children?:unknown}).children === '∑'
      if (sub !== undefined && sup !== undefined) base = element(isSum ? 'munderover' : 'msubsup', null, base, sub, sup)
      else if (sub !== undefined) base = element(isSum ? 'munder' : 'msub', null, base, sub)
      else if (sup !== undefined) base = element(isSum ? 'mover' : 'msup', null, base, sup)
      nodes.push(base)
    }
    return row(nodes)
  }
  return sequence()
}

export function MathExpression({ formula, inline = false, label }: { formula: string; inline?: boolean; label?: string }) {
  const math = element('math', { xmlns: 'http://www.w3.org/1998/Math/MathML', display: inline ? 'inline' : 'block', 'aria-label': label, style: { fontSize: '1.1em' } }, parseFormula(formula))
  return inline ? <span className="inline-block max-w-full overflow-x-auto align-middle py-1">{math}</span>
    : <div role="region" aria-label={label ?? '수식 · 필요하면 가로로 이동하세요'} tabIndex={0} className="max-w-full min-w-0 overflow-x-auto rounded px-1 py-3 text-left focus-visible:outline-2 focus-visible:outline-indigo-600">{math}</div>
}

/** Legacy inline fragments still use semantic MathML, without changing their values. */
export function MathFraction({ top, bottom }: { top: ReactNode; bottom: ReactNode }) {
  return element('math', { xmlns: 'http://www.w3.org/1998/Math/MathML', display: 'inline', className: 'mx-1' }, element('mfrac', null, token('mtext', top), token('mtext', bottom)))
}
