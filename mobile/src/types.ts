export type UserRole =
  | 'PENDING'
  | 'USER'
  | 'AGENCY'
  | 'INSTRUCTOR'
  | 'ADMIN_ASSISTANT'
  | 'ADMIN'

export interface User {
  id: string
  email: string
  name: string | null
  role: UserRole
  phoneNumber: string | null
  avatar: string | null
  isVerified: boolean
}

export interface AuthPayload {
  token: string
  user: User
}

export interface SignUpParams {
  email: string
  password: string
  name: string
  phoneNumber?: string
}

export interface AuthContextState {
  user: User | null
  token: string | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (payload: SignUpParams) => Promise<void>
  signInWithSocial: (auth: AuthPayload) => Promise<void>
  signOut: () => Promise<void>
}

export type RootStackParamList = {
  Login: undefined
  Register: undefined
  Dashboard: undefined
}
