import type { TypedObject } from '@portabletext/types'
import type { RichText } from './queries'

type Span = { text: string; marks?: string[] }

type TextBlock = TypedObject & { children?: Span[] }

export type WordToken = { text: string; isSpace: boolean; isEmphasized: boolean }

const isTextBlock = (block: TypedObject) => block._type === 'block'

export const splitLeadBlock = (value: RichText | null) => {
  const blocks = value ?? []
  const leadIndex = blocks.findIndex(isTextBlock)
  return leadIndex === -1
    ? { lead: null, rest: blocks }
    : { lead: blocks[leadIndex], rest: blocks.filter((_, blockIndex) => blockIndex !== leadIndex) }
}

export const wordTokensOf = (block: TextBlock): WordToken[] =>
  (block.children ?? []).flatMap((span) =>
    span.text
      .split(/(\s+)/)
      .filter((token) => token.length > 0)
      .map((token) => ({
        text: token,
        isSpace: /^\s+$/.test(token),
        isEmphasized: Boolean(span.marks?.includes('strong'))
      }))
  )

export const plainTextOf = (value: RichText | null) =>
  (value ?? [])
    .filter(isTextBlock)
    .map((block: TextBlock) => (block.children ?? []).map((span) => span.text).join(''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

export const truncate = (text: string, maximumLength: number) =>
  text.length <= maximumLength
    ? text
    : `${text.slice(0, text.lastIndexOf(' ', maximumLength - 1)).replace(/[,;:.!?]$/, '')}…`
