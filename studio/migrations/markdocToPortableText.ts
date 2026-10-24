import Markdoc, { type Node } from '@markdoc/markdoc'

export type SanityImage = {
  _type: 'imageWithAlt' | 'image'
  _key?: string
  alt?: string
  asset: { _sanityAsset: string }
}

type Span = { _type: 'span'; _key: string; text: string; marks: string[] }
type LinkDefinition = { _type: 'link'; _key: string; href: string }

type TextBlock = {
  _type: 'block'
  _key: string
  style: string
  markDefs: LinkDefinition[]
  children: Span[]
  listItem?: 'bullet' | 'number'
  level?: number
}

type UnkeyedItem = { _type: string; [field: string]: unknown }

type PortableTextItem = UnkeyedItem & { _key: string }

type InlineResult = { spans: Omit<Span, '_key'>[]; links: Omit<LinkDefinition, '_key'>[] }

export type ImageResolver = (source: string, alt: string) => SanityImage

const EMBED_FORMATS: Record<string, string> = {
  video: 'video',
  carte: 'map',
  carre: 'square',
  formulaire: 'form'
}

const NOT_EMBEDDABLE_HOSTS = /google\.[a-z.]+\/maps|goo\.gl/

const emptyInline: InlineResult = { spans: [], links: [] }

const mergeInline = (first: InlineResult, second: InlineResult): InlineResult => ({
  spans: [...first.spans, ...second.spans],
  links: [...first.links, ...second.links]
})

const convertInline = (node: Node, marks: string[], linkOffset: number): InlineResult => {
  const convertChildren = (childMarks: string[], childLinkOffset: number) =>
    node.children.reduce(
      (accumulated, child) =>
        mergeInline(
          accumulated,
          convertInline(child, childMarks, childLinkOffset + accumulated.links.length)
        ),
      emptyInline
    )

  switch (node.type) {
    case 'text':
      return { spans: [{ _type: 'span', text: node.attributes.content, marks }], links: [] }
    case 'softbreak':
      return { spans: [{ _type: 'span', text: ' ', marks }], links: [] }
    case 'hardbreak':
      return { spans: [{ _type: 'span', text: '\n', marks }], links: [] }
    case 'code':
      return { spans: [{ _type: 'span', text: node.attributes.content, marks }], links: [] }
    case 'strong':
      return convertChildren([...marks, 'strong'], linkOffset)
    case 'em':
      return convertChildren([...marks, 'em'], linkOffset)
    case 'link': {
      const linkKey = `link${linkOffset}`
      const nested = convertChildren([...marks, linkKey], linkOffset + 1)
      return {
        spans: nested.spans,
        links: [{ _type: 'link', href: node.attributes.href }, ...nested.links]
      }
    }
    case 'image':
      return emptyInline
    default:
      return convertChildren(marks, linkOffset)
  }
}

const withKeys = (inline: InlineResult) => ({
  children: inline.spans.map((span, spanIndex) => ({ ...span, _key: `span${spanIndex}` })),
  markDefs: inline.links.map((link, linkIndex) => ({ ...link, _key: `link${linkIndex}` }))
})

const inlineOf = (node: Node) => convertInline(node, [], 0)

const hasReadableText = (inline: InlineResult) =>
  inline.spans.some((span) => /[\p{L}\p{N}]/u.test(span.text))

const textBlock = (
  inline: InlineResult,
  style: string,
  list?: { listItem: 'bullet' | 'number'; level: number }
): Omit<TextBlock, '_key'> => ({
  _type: 'block',
  style,
  ...withKeys(inline),
  ...(list ?? {})
})

const imagesIn = (node: Node): Node[] =>
  node.type === 'image' ? [node] : node.children.flatMap(imagesIn)

const convertParagraph = (
  paragraph: Node,
  style: string,
  resolveImage: ImageResolver
): UnkeyedItem[] => {
  const inline = inlineOf(paragraph)
  const images = imagesIn(paragraph).map((image) =>
    resolveImage(image.attributes.src, image.attributes.alt ?? '')
  )
  const textBlocks = hasReadableText(inline) ? [textBlock(inline, style)] : []
  return [...textBlocks, ...images.map((image) => ({ ...image, _type: 'image' }))]
}

const convertListItem = (
  item: Node,
  listItem: 'bullet' | 'number',
  level: number,
  resolveImage: ImageResolver
): UnkeyedItem[] => {
  const textParts = item.children.filter((child) => child.type !== 'list')
  const nestedLists = item.children.filter((child) => child.type === 'list')

  const itemInline = textParts.reduce<InlineResult>(
    (accumulated, part, partIndex) =>
      mergeInline(
        partIndex === 0
          ? accumulated
          : mergeInline(accumulated, {
              spans: [{ _type: 'span', text: '\n', marks: [] }],
              links: []
            }),
        shiftLinks(inlineOf(part), accumulated.links.length)
      ),
    emptyInline
  )

  return [
    textBlock(itemInline, 'normal', { listItem, level }),
    ...nestedLists.flatMap((list) => convertList(list, level + 1, resolveImage))
  ]
}

const shiftLinks = (inline: InlineResult, offset: number): InlineResult =>
  offset === 0
    ? inline
    : {
        spans: inline.spans.map((span) => ({
          ...span,
          marks: span.marks.map((mark) =>
            mark.startsWith('link') ? `link${Number(mark.slice(4)) + offset}` : mark
          )
        })),
        links: inline.links
      }

const convertList = (list: Node, level: number, resolveImage: ImageResolver): UnkeyedItem[] =>
  list.children.flatMap((item) =>
    convertListItem(item, list.attributes.ordered ? 'number' : 'bullet', level, resolveImage)
  )

const convertEmbed = (tag: Node): UnkeyedItem => {
  const url: string = tag.attributes.url
  const title: string | undefined = tag.attributes.titre

  if (NOT_EMBEDDABLE_HOSTS.test(url)) {
    return textBlock(
      {
        spans: [{ _type: 'span', text: 'Voir sur la carte', marks: ['link0'] }],
        links: [{ _type: 'link', href: url }]
      },
      'normal'
    )
  }

  return { _type: 'embed', url, title, format: EMBED_FORMATS[tag.attributes.format] ?? 'video' }
}

const convertTag = (tag: Node, resolveImage: ImageResolver): UnkeyedItem[] => {
  switch (tag.tag) {
    case 'Photos':
      return [
        {
          _type: 'photoGrid',
          caption: tag.attributes.legende,
          images: imagesIn(tag).map((image, imageIndex) => ({
            ...resolveImage(image.attributes.src, image.attributes.alt ?? ''),
            _key: `photo${imageIndex}`
          }))
        }
      ]
    case 'Embed':
      return [convertEmbed(tag)]
    case 'Inscription':
      return [{ _type: 'helloAsso', url: tag.attributes.url, title: tag.attributes.titre }]
    default:
      return []
  }
}

const convertBlockNode = (node: Node, resolveImage: ImageResolver): UnkeyedItem[] => {
  switch (node.type) {
    case 'heading':
      return [textBlock(inlineOf(node), node.attributes.level <= 2 ? 'h2' : 'h3')]
    case 'paragraph':
      return convertParagraph(node, 'normal', resolveImage)
    case 'blockquote':
      return node.children.flatMap((child) => convertParagraph(child, 'blockquote', resolveImage))
    case 'list':
      return convertList(node, 1, resolveImage)
    case 'fence':
      return [
        textBlock(
          { spans: [{ _type: 'span', text: node.attributes.content, marks: [] }], links: [] },
          'normal'
        )
      ]
    case 'tag':
      return convertTag(node, resolveImage)
    default:
      return []
  }
}

const isEmptyTextBlock = (item: UnkeyedItem) =>
  item._type === 'block' &&
  !(item.children as Span[]).some((span) => /[\p{L}\p{N}]/u.test(span.text))

export const markdocToPortableText = (
  source: string,
  resolveImage: ImageResolver
): PortableTextItem[] =>
  Markdoc.parse(source)
    .children.flatMap((node) => convertBlockNode(node, resolveImage))
    .filter((item) => !isEmptyTextBlock(item))
    .map((item, itemIndex) => ({ ...item, _key: `block${itemIndex}` }))
