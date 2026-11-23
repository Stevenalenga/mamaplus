import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    user: {
      id: string
      role: string
      gender?: string | null
      phoneNumber?: string | null
      avatar?: string | null
      isVerified: boolean
    } & DefaultSession['user']
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role: string
    gender?: string | null
    phoneNumber?: string | null
    avatar?: string | null
    isVerified: boolean
    accessToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    gender?: string | null
    phoneNumber?: string | null
    avatar?: string | null
    isVerified: boolean
    accessToken?: string
  }
}
