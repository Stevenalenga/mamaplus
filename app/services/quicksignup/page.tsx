'use client'

import SEOHead from '@/components/seo-head'

export default function QuickSignupPage() {
    return (
        <div className="min-h-screen bg-background">
            <SEOHead
                title="Quick Signup - MamaPlus Training"
                description="Sign up quickly for MamaPlus training courses. Select your preferred course and get started today."
                canonicalUrl="https://mamaplus.co.ke/services/quicksignup"
            />

            <section className="py-20 px-4 sm:py-24 md:py-28 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8 md:mb-10">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">Quick Signup</h1>
                        <p className="text-base sm:text-lg text-muted-foreground">
                            Join MamaPlus training programs in just a few steps
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                        <iframe
                            src="https://forms.gle/qg14gKFHqMsD72sD8"
                            width="100%"
                            height="900"
                            frameBorder="0"
                            marginHeight={0}
                            marginWidth={0}
                            title="MamaPlus Quick Signup Form"
                            className="block"
                        >
                            Loading…
                        </iframe>
                    </div>

                    <p className="text-center text-sm text-muted-foreground mt-4">
                        Having trouble with the form?{' '}
                        <a
                            href="https://forms.gle/qg14gKFHqMsD72sD8"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline underline-offset-2 hover:text-primary/80"
                        >
                            Open it directly
                        </a>
                    </p>
                </div>
            </section>
        </div>
    )
}