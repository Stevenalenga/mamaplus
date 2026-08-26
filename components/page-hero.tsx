import type { ReactNode } from 'react'
import { PhotoFigure } from '@/components/photo-figure'
import { AnimatedSection } from '@/components/animated-section'

type PageHeroProps = {
  kicker: string
  title: string
  intro: string
  photo?: {
    src: string
    alt: string
    caption: string
  }
  children?: ReactNode
}

export function PageHero({ kicker, title, intro, photo, children }: PageHeroProps) {
  return (
    <section className="pt-24 pb-12 px-4 md:pt-32 md:pb-16 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className={`grid gap-8 items-center ${photo ? 'lg:grid-cols-2' : ''}`}>
          <AnimatedSection>
            <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-3">
              {kicker}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary leading-tight mb-4">
              {title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">{intro}</p>
            {children && <div className="mt-6">{children}</div>}
          </AnimatedSection>
          {photo && (
            <AnimatedSection delay={120}>
              <PhotoFigure
                src={photo.src}
                alt={photo.alt}
                caption={photo.caption}
                priority
                heightClassName="h-64 md:h-80"
              />
            </AnimatedSection>
          )}
        </div>
      </div>
    </section>
  )
}
