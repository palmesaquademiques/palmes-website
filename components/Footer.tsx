import * as React from 'react'

import * as config from '@/lib/config'
import { EmailIcon } from '@/lib/icons/email'
import { FacebookIcon } from '@/lib/icons/facebook'
import { InstagramIcon } from '@/lib/icons/instagram'

import styles from './styles.module.css'

export function FooterImpl() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='flex flex-col items-center justify-between w-screen p-4 text-sm sm:flex-row bg-palmes-light gap-4 text-palmes-dark'>
      <div>Made with ❤️ and 🤿 in Toulouse</div>
      <div>
        Copyright {currentYear} - {config.author}
      </div>

      <div className={styles.social}>
        {config.facebook && (
          <a
            className={styles.facebook}
            href={`https://facebook.com/groups/${config.facebook}`}
            title={`Facebook @${config.facebook}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <FacebookIcon />
          </a>
        )}

        {config.instagram && (
          <a
            className={styles.instagram}
            href={`https://instagram.com/${config.instagram}`}
            title={`Instagram @${config.instagram}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <InstagramIcon />
          </a>
        )}

        {config.email && (
          <a
            className={styles.email}
            href={`mailto:${config.email}`}
            title={`E-Mail ${config.author}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <EmailIcon />
          </a>
        )}
      </div>
    </footer>
  )
}

export const Footer = React.memo(FooterImpl)
