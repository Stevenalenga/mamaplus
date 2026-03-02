'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import SEOHead from '@/components/seo-head'


export default function QuickSignupPage() {
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        course: '',
        email: '',
        phone: '',
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [submittedEmail, setSubmittedEmail] = useState('')
    const [submittedPhone, setSubmittedPhone] = useState('')

    const courses = [
        'Certified Child Development Training',
        'Child Safety & CPR',
        'Educational Play & Learning',
        'Soft Skills Training',
        'Nutrition & Hygiene',
        'Early Childhood Development',
    ]

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/quicksignup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!response.ok) throw new Error('Failed to submit form')
            
            // Store email and phone before resetting form
            setSubmittedEmail(formData.email)
            setSubmittedPhone(formData.phone)
            setSuccess(true)
            setFormData({ name: '', location: '', course: '', email: '', phone: '' })
            setTimeout(() => setSuccess(false), 8000)
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <SEOHead
                title="Quick Signup - MamaPlus Training"
                description="Sign up quickly for MamaPlus training courses. Select your preferred course and get started today."
                canonicalUrl="https://mamaplus.co.ke/services/quicksignup"
            />

            <section className="py-20 px-4 sm:py-24 md:py-32 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8 md:mb-12">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">Quick Signup</h1>
                        <p className="text-base sm:text-lg text-muted-foreground">
                            Join MamaPlus training programs in just a few steps
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 sm:p-8 border border-border shadow-sm">
                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold mb-1">Signup Successful!</p>
                                        <p className="text-sm">Thank you for your interest in MamaPlus training. We've received your request and will contact you soon at:</p>
                                        <p className="text-sm font-medium mt-2">
                                            📧 {submittedEmail}<br/>
                                            📱 {submittedPhone}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Submission Failed</p>
                                        <p className="text-sm">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="John Doe"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="City/Region"
                                />
                            </div>

                            {/* Course Selection */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Preferred Course *
                                </label>
                                <select
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Select a course</option>
                                    {courses.map(course => (
                                        <option key={course} value={course}>{course}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="you@example.com"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="+254 7XX XXX XXX"
                                />
                            </div>

                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-base"
                            >
                                {loading ? 'Submitting...' : 'Complete Signup'} 
                                {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                            </Button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    )
}