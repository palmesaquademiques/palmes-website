import { FaEnvelopeOpenText } from '@react-icons/all-files/fa/FaEnvelopeOpenText'
import { FaFacebook } from '@react-icons/all-files/fa/FaFacebook'
import { FaInstagram } from '@react-icons/all-files/fa/FaInstagram'
import * as React from 'react'

import * as config from '@/lib/config'

import styles from './styles.module.css'

// TODO: merge the data and icons from PageSocial with the social links in Footer

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
            <FaFacebook />
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
            <FaInstagram />
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
            <FaEnvelopeOpenText />
          </a>
        )}
      </div>
    </footer>
  )
}

export const Footer = React.memo(FooterImpl)
