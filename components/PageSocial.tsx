import type * as React from 'react'
import cs from 'classnames'

import * as config from '@/lib/config'

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
    icon: (
      <svg x='0px' y='0px' viewBox='73 0 267 266.9'>
        <path
          fill='#7777777'
          d='M255.4,262.3v-99.8h33.5l5-38.9h-38.5V98.8c0-11.3,3.1-18.9,19.3-18.9l20.6,0V45 c-3.6-0.5-15.8-1.5-30-1.5c-29.7,0-50,18.1-50,51.4v28.7h-33.6v38.9h33.6v99.8H255.4z'
        />
      </svg>
    )
  },

  config.instagram && {
    name: 'instagram',
    href: `https://instagram.com/${config.instagram}`,
    title: `Instagram @${config.facebook}`,
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <g fill='white'>
          <rect width='20' height='20' x='2' y='2' rx='5' ry='5' />
          <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
          <line x1='17.5' x2='17.51' y1='6.5' y2='6.5' />
        </g>
      </svg>
    )
  },

  config.email && {
    name: 'email',
    href: `mailto:${config.email}`,
    title: `E-Mail ${config.author}`,
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
        <path d='M12 .64L8.23 3H5V5L2.97 6.29C2.39 6.64 2 7.27 2 8V18C2 19.11 2.9 20 4 20H20C21.11 20 22 19.11 22 18V8C22 7.27 21.61 6.64 21.03 6.29L19 5V3H15.77M7 5H17V9.88L12 13L7 9.88M8 6V7.5H16V6M5 7.38V8.63L4 8M19 7.38L20 8L19 8.63M8 8.5V10H16V8.5Z' />
      </svg>
    )
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
