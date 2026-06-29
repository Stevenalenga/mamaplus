import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { name, location, course, email, phone } = await request.json()

        console.log('Quick signup received', {
            name,
            location,
            course,
            email,
            phone,
            submittedAt: new Date().toISOString(),
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Quick signup error:', error)
        return NextResponse.json({ error: 'Failed to process signup' }, { status: 500 })
    }
}
