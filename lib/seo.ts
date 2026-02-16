import { Metadata } from 'next'

const siteConfig = {
  name: 'MamaPlus',
  description: 'Quality childcare services and professional caregiver training in Kenya and across Africa. Connect with trained caregivers, access certification programs, and support children\'s wellbeing.',
  url: 'https://mamaplus.co.ke',
  ogImage: 'https://mamaplus.co.ke/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/mamaplus',
    facebook: 'https://facebook.com/mamaplus',
    linkedin: 'https://linkedin.com/company/mamaplus',
  },
}

export function constructMetadata({
  title = 'MamaPlus - Quality Childcare Services & Caregiver Training in Kenya',
  description = 'MamaPlus connects families with trained caregivers and provides professional childcare training across Kenya. Quality care you can trust, careers you can build.',
  image = siteConfig.ogImage,
  icons = '/favicon.ico',
  noIndex = false,
  keywords = [
    'childcare services Kenya',
    'caregiver training Nairobi',
    'house manager placement',
    'professional nanny services',
    'childcare certification courses',
    'daycare Kenya',
    'nanny services Nairobi',
    'childcare training programs',
  ],
  ...props
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
  keywords?: string[]
} & Partial<Metadata> = {}): Metadata {
  return {
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    keywords: keywords.join(', '),
    authors: [
      {
        name: 'MamaPlus',
        url: siteConfig.url,
      },
    ],
    creator: 'MamaPlus',
    openGraph: {
      type: 'website',
      locale: 'en_KE',
      url: siteConfig.url,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@mamaplus',
    },
    icons,
    metadataBase: new URL(siteConfig.url),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    ...props,
  }
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MamaPlus',
  description: siteConfig.description,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+254-769-886-655',
    contactType: 'customer service',
    areaServed: ['KE', 'Africa'],
    availableLanguage: ['English', 'Swahili'],
  },
  sameAs: [
    siteConfig.links.twitter,
    siteConfig.links.facebook,
    siteConfig.links.linkedin,
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Nairobi',
    addressCountry: 'KE',
  },
}

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'MamaPlus Training & Support Centre',
  image: `${siteConfig.url}/logo.png`,
  '@id': siteConfig.url,
  url: siteConfig.url,
  telephone: '+254-769-886-655',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Nairobi',
    addressLocality: 'Nairobi',
    addressCountry: 'KE',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -1.286389,
    longitude: 36.817223,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '08:00',
    closes: '18:00',
  },
  priceRange: '$$',
}

export default siteConfig
