import { Metadata } from 'next'

const siteConfig = {
  name: 'MamaPlus',
  description: 'MamaPlus trains and certifies caregivers in Kenya, helps families understand quality childcare, and partners with organisations to strengthen care across communities.',
  url: 'https://mamaplus.co.ke',
  ogImage: 'https://mamaplus.co.ke/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/mamaplus',
    facebook: 'https://facebook.com/mamaplus',
    linkedin: 'https://linkedin.com/company/mamaplus',
  },
}

export function constructMetadata({
  title = 'MamaPlus - Trusted Childcare Starts with Trained Caregivers',
  description = 'MamaPlus trains and certifies caregivers, helps families understand quality care, and partners with organisations to strengthen childcare across Kenya.',
  image = siteConfig.ogImage,
  icons = '/favicon.ico',
  noIndex = false,
  keywords = [
    'childcare training Kenya',
    'caregiver certification Nairobi',
    'trusted childcare Kenya',
    'early childhood training',
    'childcare courses Kenya',
    'professional caregiver training',
    'childcare partners Kenya',
    'MamaPlus training',
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
    telephone: '+254769886655',
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
  telephone: '+254769886655',
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
