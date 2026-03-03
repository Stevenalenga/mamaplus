import SEOHead from '@/components/seo-head'

export default function PartnerPage() {
  const networkSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Join the MamaPlus ELC Network',
    description: 'Learn how to join the MamaPlus ELC Network and start an early learning programme in your community.',
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Join the MamaPlus ELC Network"
        description="Make a difference in your community by joining the MamaPlus ELC Network and running an early learning programme with training and ongoing support."
        keywords={[
          'MamaPlus ELC Network',
          'early learning programme Kenya',
          'start childcare centre',
          'community childcare opportunity',
        ]}
        canonicalUrl="https://mamaplus.co.ke/partner"
        schema={networkSchema}
      />

      <section className="pt-20 pb-10 px-4 sm:pt-24 sm:pb-12 md:pt-32 md:pb-16 lg:px-8 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 md:mb-6 leading-tight">
            Join the MamaPlus ELC Network
          </h1>
          <p className="text-xl sm:text-2xl font-semibold text-secondary max-w-3xl mx-auto">
            Make a Difference in Your Community
          </p>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            Every child deserves a safe, nurturing place to learn and grow. At MamaPlus, we bring quality early learning to children who need it most.
          </p>
        </div>
      </section>

      <section className="py-10 px-4 sm:py-12 md:py-16 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10">
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 md:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">By joining the MamaPlus ELC Network, you can:</h2>
            <ul className="space-y-3 text-base sm:text-lg text-muted-foreground">
              <li>Run your own early learning programme in your community</li>
              <li>Support children to develop skills for school and life</li>
              <li>Receive guidance, training, and ongoing support</li>
              <li>Make a lasting difference for children and families</li>
            </ul>
            <p className="mt-5 text-base sm:text-lg text-foreground font-medium">
              No prior childcare experience is needed—just a love for children and a passion for learning.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 md:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">Is This Opportunity for You?</h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-4">You’re ready to join the MamaPlus ELC Network if you:</p>
            <ul className="space-y-3 text-base sm:text-lg text-muted-foreground">
              <li>Enjoy working with young children</li>
              <li>Want to make a real impact locally</li>
              <li>Are committed to helping children thrive</li>
              <li>Are eager to start your own programme</li>
            </ul>
            <p className="mt-5 text-base sm:text-lg text-foreground font-medium">
              Take the first step today and explore the opportunity with us!
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 md:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">How the Network Works</h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-4">Becoming part of the MamaPlus ELC Network is simple:</p>
            <ol className="space-y-3 text-base sm:text-lg text-muted-foreground list-decimal list-inside">
              <li>Apply – Let us know you’re interested</li>
              <li>Meet Our Team – Learn more about how a MamaPlus ELC centre operates</li>
              <li>Start Your Programme – Begin running your own centre in your community</li>
            </ol>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-border rounded-xl p-5 sm:p-6 md:p-8 text-center">
            <p className="text-lg sm:text-xl md:text-2xl text-primary font-semibold">
              “We’ll guide you every step of the way, providing support and tools to help you succeed.”
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
