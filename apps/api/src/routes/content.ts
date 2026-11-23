import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { getBlogPost, getBlogPosts, getBlogPostsByCategory } from '../lib/blog'

export const contentRouter = new Hono<AppEnv>()

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * GET /api/blog
 * Public list of published blog posts. Optional ?category= filter.
 */
contentRouter.get('/api/blog', async (c) => {
  try {
    const category = c.req.query('category')?.trim()
    const posts = category
      ? await getBlogPostsByCategory(category)
      : await getBlogPosts()

    const categories = [
      ...new Set((await getBlogPosts()).map((post) => post.category).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b))

    return c.json({
      success: true,
      data: {
        posts,
        categories,
      },
    })
  } catch (error) {
    console.error('Public blog list error:', error)
    return c.json(
      { success: false, message: 'Failed to load blog posts' },
      500
    )
  }
})

/**
 * GET /api/blog/:slug
 * Public single published blog post + related posts.
 */
contentRouter.get('/api/blog/:slug', async (c) => {
  try {
    const slug = c.req.param('slug')

    const post = await getBlogPost(slug)
    if (!post) {
      return c.json(
        { success: false, message: 'Post not found' },
        404
      )
    }

    const allPosts = await getBlogPosts()
    const relatedPosts = allPosts
      .filter(
        (candidate) =>
          candidate.slug !== post.slug &&
          (candidate.category === post.category ||
            candidate.tags.some((tag) => post.tags.includes(tag)))
      )
      .slice(0, 3)

    return c.json({
      success: true,
      data: {
        post,
        relatedPosts,
      },
    })
  } catch (error) {
    console.error('Public blog detail error:', error)
    return c.json(
      { success: false, message: 'Failed to load blog post' },
      500
    )
  }
})

contentRouter.post('/api/contact', async (c) => {
  try {
    const { name, email, phone, subject, message } = await c.req.json()

    if (!name || !email || !subject || !message) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    const enquiriesEmail = process.env.ENQUIRIES_EMAIL || 'mamapluske@gmail.com'
    const safeName = escapeHtml(String(name))
    const safeEmail = escapeHtml(String(email))
    const safePhone = escapeHtml(String(phone || 'Not provided'))
    const safeSubject = escapeHtml(String(subject))
    const safeMessage = escapeHtml(String(message)).replace(/\n/g, '<br/>')

    console.log('Contact enquiry received', {
      to: enquiriesEmail,
      name: safeName,
      email: safeEmail,
      phone: safePhone,
      subject: safeSubject,
      message: safeMessage,
      submittedAt: new Date().toISOString(),
    })

    return c.json({ success: true })
  } catch (error) {
    console.error('Contact enquiry error:', error)
    return c.json({ error: 'Failed to process enquiry' }, 500)
  }
})

contentRouter.post('/api/quicksignup', async (c) => {
  try {
    const { name, location, course, email, phone } = await c.req.json()

    console.log('Quick signup received', {
      name,
      location,
      course,
      email,
      phone,
      submittedAt: new Date().toISOString(),
    })

    return c.json({ success: true })
  } catch (error) {
    console.error('Quick signup error:', error)
    return c.json({ error: 'Failed to process signup' }, 500)
  }
})
