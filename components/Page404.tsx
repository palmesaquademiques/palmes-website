import type * as types from '@/lib/types'

import { PageHead } from './PageHead'
import styles from './styles.module.css'

export function Page404({ site, pageId, error }: types.PageProps) {
  const title = site?.name || 'Page introuvable'

  return (
    <>
      <PageHead site={site} title={title} />

      <div className={styles.container}>
        <main className={styles.main}>
          <h1>Page introuvable</h1>

          {error ? (
            <p>{error.message}</p>
          ) : (
            pageId && (
              <p>
                Vérifiez que la page Notion &quot;{pageId}&quot; est bien
                accessible publiquement.
              </p>
            )
          )}

          <img
            src='/404.png'
            alt='404 introuvable'
            className={styles.errorImage}
          />
        </main>
      </div>
    </>
  )
}
