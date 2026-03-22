import cs from 'classnames'
import dynamic from 'next/dynamic'
import Image from 'next/legacy/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { type PageBlock } from 'notion-types'
import {
  formatDate,
  getBlockTitle,
  getBlockValue,
  getPageProperty
} from 'notion-utils'
import * as React from 'react'
import { type NotionComponents, NotionRenderer } from 'react-notion-x'
import { useSearchParam } from 'react-use'

import type * as types from '@/lib/types'
import * as config from '@/lib/config'
import { mapImageUrl } from '@/lib/map-image-url'
import { getCanonicalPageUrl, mapPageUrl } from '@/lib/map-page-url'
import { searchNotion } from '@/lib/search-notion'

import { Footer } from './Footer'
import { Loading } from './Loading'
import { NotionPageHeader } from './NotionPageHeader'
import { Page404 } from './Page404'
import { PageAside } from './PageAside'
import { PageHead } from './PageHead'
import styles from './styles.module.css'

// -----------------------------------------------------------------------------
// dynamic imports for optional components
// -----------------------------------------------------------------------------

const Collection = dynamic(() =>
  import('react-notion-x/third-party/collection').then((m) => m.Collection)
)
const Pdf = dynamic(
  () => import('react-notion-x/third-party/pdf').then((m) => m.Pdf),
  {
    ssr: false
  }
)
const Modal = dynamic(
  () =>
    import('react-notion-x/third-party/modal').then((m) => {
      m.Modal.setAppElement('.notion-viewport')
      return m.Modal
    }),
  {
    ssr: false
  }
)

const propertyLastEditedTimeValue = (
  { block, pageHeader }: any,
  defaultFn: () => React.ReactNode
) => {
  if (pageHeader && block?.last_edited_time) {
    return `Dernière mise à jour ${formatDate(block?.last_edited_time, {
      month: 'long'
    })}`
  }

  return defaultFn()
}

const propertyDateValue = (
  { data, schema, pageHeader }: any,
  defaultFn: () => React.ReactNode
) => {
  if (pageHeader && schema?.name?.toLowerCase() === 'published') {
    const publishDate = data?.[0]?.[1]?.[0]?.[1]?.start_date

    if (publishDate) {
      return `${formatDate(publishDate, {
        month: 'long'
      })}`
    }
  }

  return defaultFn()
}

const propertyTextValue = (
  { schema, pageHeader }: any,
  defaultFn: () => React.ReactNode
) => {
  if (pageHeader && schema?.name?.toLowerCase() === 'author') {
    return <b>{defaultFn()}</b>
  }

  return defaultFn()
}

const notionRendererComponents: Partial<NotionComponents> = {
  nextLegacyImage: Image,
  nextLink: Link,
  Collection,
  Pdf,
  Modal,
  Header: NotionPageHeader,
  propertyLastEditedTimeValue,
  propertyTextValue,
  propertyDateValue
}

export function NotionPage({
  site,
  recordMap,
  error,
  pageId
}: types.PageProps) {
  const router = useRouter()
  const lite = useSearchParam('lite')

  const siteMapPageUrl = React.useMemo(() => {
    const params: any = {}
    if (lite) params.lite = lite

    const searchParams = new URLSearchParams(params)
    return site ? mapPageUrl(site, recordMap!, searchParams) : undefined
  }, [site, recordMap, lite])

  const keys = Object.keys(recordMap?.block || {})
  const block = getBlockValue(recordMap?.block?.[keys[0]!])

  const isBlogPost =
    block?.type === 'page' && block?.parent_table === 'collection'

  const showTableOfContents = !!isBlogPost
  const minTableOfContentsItems = 3

  const pageAside = React.useMemo(
    () => (
      <PageAside
        block={block!}
        recordMap={recordMap!}
        isBlogPost={isBlogPost}
      />
    ),
    [block, recordMap, isBlogPost]
  )

  if (router.isFallback) {
    return <Loading />
  }

  if (error || !site || !block || !recordMap) {
    return <Page404 site={site} pageId={pageId} error={error} />
  }

  const title = getBlockTitle(block, recordMap) || site.name

  console.log('notion page', {
    isDev: config.isDev,
    title,
    pageId,
    rootNotionPageId: site.rootNotionPageId,
    recordMap
  })

  if (!config.isServer) {
    // add important objects to the window global for easy debugging
    const g = window as any
    g.pageId = pageId
    g.recordMap = recordMap
    g.block = block
  }

  const canonicalPageUrl = config.isDev
    ? undefined
    : getCanonicalPageUrl(site, recordMap)(pageId)

  const socialImage = mapImageUrl(
    getPageProperty<string>('Social Image', block, recordMap) ||
      (block as PageBlock).format?.page_cover ||
      config.defaultPageCover,
    block
  )

  const socialDescription =
    getPageProperty<string>('Description', block, recordMap) ||
    config.description

  return (
    <>
      <PageHead
        pageId={pageId}
        site={site}
        title={title}
        description={socialDescription}
        image={socialImage}
        url={canonicalPageUrl}
        isBlogPost={isBlogPost}
      />

      <NotionRenderer
        className={'content-page'}
        bodyClassName={cs(styles.notion, 'content-page')}
        components={notionRendererComponents}
        recordMap={recordMap}
        rootPageId={site.rootNotionPageId}
        rootDomain={site.domain}
        fullPage={true}
        previewImages={!!recordMap.preview_images}
        showCollectionViewDropdown={false}
        showTableOfContents={showTableOfContents}
        minTableOfContentsItems={minTableOfContentsItems}
        defaultPageIcon={config.defaultPageIcon}
        defaultPageCover={config.defaultPageCover}
        defaultPageCoverPosition={config.defaultPageCoverPosition}
        mapPageUrl={siteMapPageUrl}
        mapImageUrl={mapImageUrl}
        searchNotion={config.isSearchEnabled ? searchNotion : undefined}
        pageAside={pageAside}
        footer={<Footer />}
      />
    </>
  )
}
