const json = { 'application/json': { schema: { type: 'object' } } }

function op(tag: string, summary: string, auth = false) {
  return {
    tags: [tag],
    summary,
    ...(auth
      ? { security: [{ bearerAuth: [] }] }
      : {}),
    responses: {
      '200': { description: 'Success', content: json },
      '400': { description: 'Bad request', content: json },
      '401': { description: 'Not authenticated', content: json },
      '403': { description: 'Forbidden', content: json },
      '404': { description: 'Not found', content: json },
    },
  }
}

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'MamaPlus API',
    version: '1.0.0',
    description:
      'Standalone HTTP API for the MamaPlus website and Android app. Paths and JSON shapes match the previous Next.js route handlers. Authenticated routes expect Authorization: Bearer <jwt>.',
  },
  servers: [{ url: 'http://localhost:4000', description: 'Local' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  tags: [
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Courses' },
    { name: 'Learning' },
    { name: 'Payments' },
    { name: 'Agencies' },
    { name: 'Admin' },
    { name: 'Content' },
    { name: 'Files' },
  ],
  paths: {
    '/health': { get: op('Auth', 'Health check') },
    '/api/users/register': { post: op('Auth', 'Register with email or phone') },
    '/api/users/login': { post: op('Auth', 'Login with email or phone and password') },
    '/api/users/logout': { post: op('Auth', 'Revoke the current session', true) },
    '/api/users/sessions': { get: op('Users', 'List the current user sessions', true) },
    '/api/users/sessions/{id}': { delete: op('Users', 'Revoke one of the current user sessions', true) },
    '/api/auth/social': { post: op('Auth', 'Exchange a social profile for a JWT') },
    '/api/admin/login': { post: op('Auth', 'Admin credential login, returns a JWT') },
    '/api/admin/logout': {
      get: op('Auth', 'Redirect to the website admin login'),
      post: op('Auth', 'Admin logout'),
    },
    '/api/users/me': {
      get: op('Users', 'Current user profile', true),
      patch: op('Users', 'Update current user', true),
    },
    '/api/users/me/avatar': {
      post: op('Users', 'Upload avatar', true),
      delete: op('Users', 'Remove avatar', true),
    },
    '/api/users/onboard': { post: op('Users', 'Complete onboarding', true) },
    '/api/users/push-token': {
      post: op('Users', 'Register an Expo push token', true),
      delete: op('Users', 'Remove an Expo push token', true),
    },
    '/api/users/{id}': {
      get: op('Users', 'Get a user', true),
      patch: op('Users', 'Update a user', true),
      delete: op('Users', 'Delete a user', true),
    },
    '/api/courses': {
      get: op('Courses', 'List or search courses'),
      post: op('Courses', 'Create a course', true),
    },
    '/api/courses/{id}': {
      get: op('Courses', 'Get a course'),
      patch: op('Courses', 'Update a course', true),
      delete: op('Courses', 'Delete a course', true),
    },
    '/api/courses/{id}/publish': { post: op('Courses', 'Publish a course', true) },
    '/api/courses/{id}/unpublish': { post: op('Courses', 'Unpublish a course', true) },
    '/api/courses/{id}/modules': { post: op('Courses', 'Add a module', true) },
    '/api/courses/{id}/modules/{moduleId}': {
      patch: op('Courses', 'Update a module', true),
      delete: op('Courses', 'Delete a module', true),
    },
    '/api/courses/{id}/modules/{moduleId}/lessons': { post: op('Courses', 'Add a lesson', true) },
    '/api/courses/{id}/modules/{moduleId}/lessons/{lessonId}': {
      patch: op('Courses', 'Update a lesson', true),
      delete: op('Courses', 'Delete a lesson', true),
    },
    '/api/enrollments': {
      get: op('Learning', 'List enrollments', true),
      post: op('Learning', 'Create an enrollment', true),
    },
    '/api/progress': {
      get: op('Learning', 'Get lesson progress', true),
      post: op('Learning', 'Update lesson progress', true),
    },
    '/api/payments/create': { post: op('Payments', 'Create a payment record') },
    '/api/payments/confirm': { post: op('Payments', 'Confirm a payment') },
    '/api/paystack/initialize': { post: op('Payments', 'Initialize a Paystack transaction') },
    '/api/paystack/initialize-cart': { post: op('Payments', 'Initialize a cart Paystack transaction') },
    '/api/paystack/mobile-money/initialize': { post: op('Payments', 'Initialize mobile money') },
    '/api/paystack/verify': { get: op('Payments', 'Verify a Paystack reference') },
    '/api/paystack/callback': { get: op('Payments', 'Browser callback after Paystack checkout') },
    '/api/paystack/cart-callback': { get: op('Payments', 'Browser callback after cart checkout') },
    '/api/paystack/webhook': { post: op('Payments', 'Paystack webhook') },
    '/api/agencies/stats': { get: op('Agencies', 'Agency dashboard stats', true) },
    '/api/agencies/caregivers': {
      get: op('Agencies', 'List recruited caregivers', true),
      post: op('Agencies', 'Recruit a caregiver', true),
    },
    '/api/agencies/caregivers/search': { get: op('Agencies', 'Search caregivers', true) },
    '/api/agencies/caregivers/{id}': {
      patch: op('Agencies', 'Update a caregiver relationship', true),
      delete: op('Agencies', 'Remove a caregiver relationship', true),
    },
    '/api/agencies/sponsorships': { post: op('Agencies', 'Create a sponsorship', true) },
    '/api/admin/stats': { get: op('Admin', 'Admin dashboard stats', true) },
    '/api/admin/users': {
      get: op('Admin', 'List users', true),
      patch: op('Admin', 'Update users', true),
    },
    '/api/admin/users/{id}': { get: op('Admin', 'Get a user for admin', true) },
    '/api/admin/schools': {
      get: op('Admin', 'List schools', true),
      post: op('Admin', 'Create a school', true),
    },
    '/api/admin/schools/{id}': {
      get: op('Admin', 'Get a school', true),
      patch: op('Admin', 'Update a school', true),
      delete: op('Admin', 'Delete a school', true),
    },
    '/api/admin/educators': {
      get: op('Admin', 'List educators', true),
      post: op('Admin', 'Create an educator', true),
      patch: op('Admin', 'Update an educator', true),
      delete: op('Admin', 'Delete an educator', true),
    },
    '/api/admin/enrollments': {
      get: op('Admin', 'List enrollments', true),
      post: op('Admin', 'Create an enrollment', true),
      patch: op('Admin', 'Update an enrollment', true),
    },
    '/api/admin/certificates': {
      get: op('Admin', 'List certificates', true),
      post: op('Admin', 'Issue a certificate', true),
      delete: op('Admin', 'Delete a certificate', true),
    },
    '/api/admin/reviews': {
      get: op('Admin', 'List reviews', true),
      patch: op('Admin', 'Update a review', true),
      delete: op('Admin', 'Delete a review', true),
    },
    '/api/admin/agencies': { get: op('Admin', 'List agencies', true) },
    '/api/admin/payments': { get: op('Admin', 'List payments', true) },
    '/api/admin/notifications': {
      get: op('Admin', 'List notification logs', true),
      post: op('Admin', 'Send a push notification', true),
    },
    '/api/admin/blog': {
      get: op('Admin', 'List blog posts including drafts', true),
      post: op('Admin', 'Create a blog post', true),
      put: op('Admin', 'Update a blog post', true),
      delete: op('Admin', 'Delete a blog post', true),
    },
    '/api/blog': { get: op('Content', 'List published blog posts') },
    '/api/blog/{slug}': { get: op('Content', 'Get a blog post') },
    '/api/contact': { post: op('Content', 'Submit a contact enquiry') },
    '/api/quicksignup': { post: op('Content', 'Submit a quick signup') },
    '/api/upload': { post: op('Files', 'Upload a file', true) },
    '/api/upload/{publicId}': {
      post: op('Files', 'Replace an uploaded file', true),
      delete: op('Files', 'Delete an uploaded file', true),
    },
    '/api/files/{path}': { get: op('Files', 'Download an uploaded file') },
  },
}
