import { PageHead } from './PageHead'
import styles from './styles.module.css'

export function ErrorPage({ statusCode }: { statusCode: number }) {
  const title = 'Erreur'

  return (
    <>
      <PageHead title={title} />

      <div className={styles.container}>
        <main className={styles.main}>
          <h1>Erreur de chargement</h1>

          {statusCode && <p>Code d&apos;erreur : {statusCode}</p>}

          <img src='/error.png' alt='Erreur' className={styles.errorImage} />
        </main>
      </div>
    </>
  )
}
