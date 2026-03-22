import type * as React from 'react'
import cs from 'classnames'

import * as config from '@/lib/config'
import { EmailIcon } from '@/lib/icons/email'
import { FacebookIcon } from '@/lib/icons/facebook'
import { InstagramIcon } from '@/lib/icons/instagram'

import styles from './PageSocial.module.css'

interface SocialLink {
  name: string
  title: string
  icon: React.ReactNode
  href?: string
}

const socialLinks: SocialLink[] = [
  config.facebook && {
    name: 'facebook',
    href: `https://facebook.com/groups/${config.facebook}`,
    title: `Facebook @${config.facebook}`,
    icon: <FacebookIcon />
  },

  config.instagram && {
    name: 'instagram',
    href: `https://instagram.com/${config.instagram}`,
    title: `Instagram @${config.instagram}`,
    icon: <InstagramIcon fill='white' />
  },

  config.email && {
    name: 'email',
    href: `mailto:${config.email}`,
    title: `Courriel ${config.author}`,
    icon: <EmailIcon />
  }
].filter(Boolean)

export function PageSocial() {
  return (
    <div className={styles.pageSocial}>
      {socialLinks.map((action) => (
        <a
          className={cs(styles.action, styles[action.name])}
          href={action.href}
          key={action.name}
          title={action.title}
          target='_blank'
          rel='noopener noreferrer'
        >
          <div className={styles.actionBg}>
            <div className={styles.actionBgPane} />
          </div>

          <div className={styles.actionBg}>{action.icon}</div>
        </a>
      ))}
    </div>
  )
}
