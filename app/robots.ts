import { MetadataRoute } from 'next'
import { disabledPublicPaths } from '@/lib/feature-flags'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/members/', '/coming-soon', ...disabledPublicPaths()],
    },
    sitemap: 'https://ttpsswa.vercel.app/sitemap.xml',
  }
}
