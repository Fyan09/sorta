import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// @ts-ignore
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SORTA',
  description: 'Sistem monitoring kualitas telur ayam terintegrasi dengan Grafana',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  )
}