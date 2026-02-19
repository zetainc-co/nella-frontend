import type { User, Session, RegistrationFormData } from '@/types/auth-types'

const STORAGE_KEYS = {
  USERS: 'nella_users',
  SESSION: 'nella_session',
}

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; session: Session }> {
    // Mock implementation for MVP
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

      if (!user) {
        throw new Error('Email o contraseña incorrectos')
      }

      // Mock password validation - accept any non-empty password for MVP
      if (!password || password.length < 8) {
        throw new Error('Email o contraseña incorrectos')
      }

      if (!user.emailVerified) {
        throw new Error('Debes verificar tu email antes de iniciar sesión')
      }

      const session: Session = {
        userId: user.id,
        tenantId: user.tenantId,
        tenantSlug: user.tenantSlug,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        accessToken: '',  // mock — reemplazar con JWT real del backend
        refreshToken: '', // mock — reemplazar con JWT real del backend
        loginAt: new Date().toISOString(),
      }

      // Save session to localStorage
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session))

      return { user, session }
    } catch (error) {
      if (error instanceof Error) throw error
      throw new Error('Error al iniciar sesión')
    }
  },

  async register(formData: RegistrationFormData): Promise<{ user: User; session: Session }> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')

      if (users.some((u) => u.email.toLowerCase() === formData.email.toLowerCase())) {
        throw new Error('El email ya está registrado')
      }

      const tenantId = `tenant-${Date.now()}`
      const userId = `user-${Date.now()}`

      const user: User = {
        id: userId,
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        tenantId,
        tenantSlug: formData.companyName.toLowerCase().replace(/\s+/g, '-'),
        role: 'admin',
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      users.push(user)
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))

      const session: Session = {
        userId: user.id,
        tenantId: user.tenantId,
        tenantSlug: user.tenantSlug,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        accessToken: '',  // mock — reemplazar con JWT real del backend
        refreshToken: '', // mock — reemplazar con JWT real del backend
        loginAt: new Date().toISOString(),
      }

      // Save session to localStorage
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session))

      return { user, session }
    } catch (error) {
      if (error instanceof Error) throw error
      throw new Error('Error al registrar usuario')
    }
  },

  async sendVerificationEmail(email: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    console.log('[Mock] Verification email sent to:', email)
  },

  async verifyEmail(code: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (code !== '123456') {
      throw new Error('Código inválido')
    }

    try {
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
      // For MVP: verify the most recently added user
      if (users.length > 0) {
        users[users.length - 1].emailVerified = true
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
      }
    } catch {
      throw new Error('Error al verificar email')
    }
  },

  async requestPasswordReset(email: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    console.log('[Mock] Password reset email sent to:', email)
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    console.log('[Mock] Password reset for token:', token)
  },

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.SESSION)
  },
}
