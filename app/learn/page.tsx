import Link from 'next/link'
import { ArrowRight, BookOpen, Building2, GraduationCap, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/page-hero'
import { AnimatedSection } from '@/components/animated-section'
import SEOHead from '@/components/seo-head'
import { getBlogPosts } from '@/lib/blog'

export const dynamic = 'force-dynamic'

const learningPaths = [
  {
    icon: GraduationCap,
    title: 'Caregiver training',
    description: 'Build professional skills in child development, safety, and emotional care—then practise with support.',
    href: '/courses',
    cta: 'Browse courses',
  },
  {
    icon: Heart,
    title: 'Parent learning',
    description: 'Workshops and guidance on nurturing care, child development, and how to support the adults who care for your child.',
    href: '/families',
    cta: 'Learn as a parent',
  },
  {
    icon: Building2,
    title: 'Centre & team training',
    description: 'Staff certification, quality standards, and peer learning for childcare centres and early learning programmes.',
    href: '/services',
    cta: 'See how it is applied',
  },
]

const howTrainingWorks = [
  { step: '1', title: 'Enrol', text: 'Choose a course that matches your role and goals.' },
  { step: '2', title: 'Train', text: 'Learn in our centres, in the community, or through guided modules.' },
  { step: '3', title: 'Certify', text: 'Complete assessments and earn recognised credentials.' },
  { step: '4', title: 'Practise', text: 'Apply skills at home, in centres, and with ongoing support.' },
]

export default async function LearnPage() {
  const posts = (await getBlogPosts()).slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background">
      <SEOHead
        title="Learn - Training Resources & Childcare Knowledge"
        description="Explore MamaPlus learning paths, training resources, and articles on professional childcare, child development, and caregiver skills in Kenya."
        keywords={[
          'childcare training resources Kenya',
          'caregiver learning paths',
          'early childhood education Kenya',
          'MamaPlus learn',
        ]}
        canonicalUrl="https://mamaplus.co.ke/learn"
      />

      <PageHero
        kicker="Learn with MamaPlus"
        title="A resource library for people who care for children"
        intro="Follow a learning path, browse training articles, and enrol in courses that turn caregiving into a practised profession."
        photo={{
          src: '/mamaplus images/education.jpeg',
          alt: 'Learners in a MamaPlus classroom session',
          caption: 'Classroom practice: child development skills taught in session',
        }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/courses">
            <Button className="bg-primary hover:bg-primary/90 text-white">Explore courses</Button>
          </Link>
          <Link href="/blog">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
              Browse articles
            </Button>
          </Link>
        </div>
      </PageHero>

      <section className="py-12 px-4 lg:px-8 bg-white/60">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">Learning paths</p>
            <h2 className="text-3xl font-bold text-primary mb-8">Start where you are</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {learningPaths.map((path, index) => (
              <AnimatedSection key={path.title} delay={index * 80}>
                <div className="h-full bg-white border border-border rounded-2xl p-6 flex flex-col">
                  <path.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{path.title}</h3>
                  <p className="text-muted-foreground flex-1 mb-6">{path.description}</p>
                  <Link href={path.href} className="text-primary font-semibold inline-flex items-center gap-1 hover:underline">
                    {path.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">How training works</p>
            <h2 className="text-3xl font-bold text-primary mb-8">From enrolment to practice</h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {howTrainingWorks.map((item, index) => (
              <AnimatedSection key={item.step} delay={index * 70}>
                <div className="bg-white border border-border rounded-2xl p-5 h-full">
                  <p className="text-3xl font-bold text-primary mb-2">{item.step}</p>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 lg:px-8 bg-white/60">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">From the library</p>
              <h2 className="text-3xl font-bold text-primary">Featured articles</h2>
            </div>
            <Link href="/blog" className="text-primary font-semibold inline-flex items-center gap-1 hover:underline">
              All articles <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimatedSection>
          {posts.length === 0 ? (
            <AnimatedSection>
              <div className="bg-white border border-border rounded-2xl p-8 text-center">
                <BookOpen className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="text-muted-foreground">Articles will appear here as they are published.</p>
                <Link href="/courses" className="inline-block mt-4">
                  <Button className="bg-primary hover:bg-primary/90 text-white">Explore courses meanwhile</Button>
                </Link>
              </div>
            </AnimatedSection>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <AnimatedSection key={post.slug} delay={index * 80}>
                  <article className="h-full bg-white border border-border rounded-2xl p-6 flex flex-col">
                    <p className="text-xs font-semibold text-primary mb-2">{post.category}</p>
                    <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground flex-1 mb-4 line-clamp-3">{post.description}</p>
                    <Link href={`/blog/${post.slug}`} className="text-primary font-semibold inline-flex items-center gap-1 hover:underline">
                      Read article <ArrowRight className="w-4 h-4" />
                    </Link>
                  </article>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 lg:px-8">
        <AnimatedSection>
          <div className="max-w-4xl mx-auto text-center bg-primary rounded-3xl px-6 py-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to start a course?</h2>
            <p className="text-white/90 mb-6">Browse the catalogue and enrol in professional childcare training.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/courses">
                <Button className="bg-white text-primary hover:bg-white/90">Explore courses</Button>
              </Link>
              <Link href="/our-platform">
                <Button variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
                  Learning tools
                </Button>
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </div>
  )
}
