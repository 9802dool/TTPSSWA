import { MetadataRoute } from 'next'
import { isSectionEnabled } from '@/lib/feature-flags'
import { SITE_ORIGIN } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_ORIGIN
  const lastModified = new Date()

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/executive`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/central-committee-representatives`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/committees`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/subsidiaries`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/partnership`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  if (isSectionEnabled('hotel')) {
    entries.push(
      {
        url: `${baseUrl}/hotel-reservations`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/noel-chase-hotel-and-conference-centre`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
    )
  }

  if (isSectionEnabled('membershipServices')) {
    entries.push({
      url: `${baseUrl}/membership-services`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    })
  }

  if (isSectionEnabled('membershipSignup')) {
    entries.push({
      url: `${baseUrl}/become-a-member`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    })
  }

  entries.push(
    {
      url: `${baseUrl}/rule-book`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  )

  return entries
}
