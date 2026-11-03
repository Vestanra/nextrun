import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'path'
import { demoEvents } from './src/lib/demoEvents'
import { canonicalUrl, getRouteSeo, SITE_URL } from './src/lib/seo'

const SEO_BLOCK = /<!-- SEO META START -->[\s\S]*?<!-- SEO META END -->/

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function withSeo(html: string, pathname: string): string {
  const seo = getRouteSeo(pathname)
  const robots = seo.noIndex
    ? '\n    <meta name="robots" content="noindex, nofollow" />'
    : ''
  const block = `<!-- SEO META START -->
    <meta name="description" content="${escapeHtml(seo.description)}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl(pathname))}" />${robots}
    <title>${escapeHtml(seo.title)}</title>
    <!-- SEO META END -->`
  return html.replace(SEO_BLOCK, block)
}

function staticRoutes(): Plugin {
  return {
    name: 'nextrun-static-routes',
    apply: 'build',
    transformIndexHtml(html) {
      return withSeo(html, '/')
    },
    async closeBundle() {
      const outDir = path.resolve(import.meta.dirname, 'dist')
      const shell = await readFile(path.join(outDir, 'index.html'), 'utf8')

      const writeRoute = async (route: string, pathname: string) => {
        const directory = path.join(outDir, ...route.split('/'))
        await mkdir(directory, { recursive: true })
        await writeFile(path.join(directory, 'index.html'), withSeo(shell, pathname))
      }

      await Promise.all([
        ...demoEvents.flatMap((event) => [
          writeRoute(`events/${event.id}`, `/events/${event.id}/`),
          writeRoute(`events/${event.id}/checkout`, `/events/${event.id}/checkout/`),
        ]),
        writeRoute('not-found', '/not-found/'),
        writeFile(path.join(outDir, '404.html'), withSeo(shell, '/not-found/')),
      ])

      const sitemapUrls = [
        `${SITE_URL}/`,
        ...demoEvents.map((event) => `${SITE_URL}/events/${event.id}/`),
      ]
      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...sitemapUrls.map((url) => `  <url><loc>${url}</loc></url>`),
        '</urlset>',
        '',
      ].join('\n')
      await writeFile(path.join(outDir, 'sitemap.xml'), sitemap)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // The GitHub user site is served from https://vestanra.github.io/.
  base: '/',
  plugins: [react(), staticRoutes()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
