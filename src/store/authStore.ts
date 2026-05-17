import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthResponse, Role } from '../types'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  role: Role | null

  setAuth: (data: AuthResponse) => void
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      role: null,

      setAuth: (data) => {
        localStorage.setItem('token', data.token)
        set({
          token: data.token,
          isAuthenticated: true,
          role: data.role,
          user: {
            id: data.userId,
            email: data.email,
            username: data.username,
            name: data.name,
            avatar: data.avatar,
            role: data.role,
            bio: null,
            tiktokLink: null,
            instagramLink: null,
            facebookLink: null,
            followersCount: 0,
            followingCount: 0,
            likesCount: 0,
            isFollowing: false,
          }
        })
      },

      setUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem('token')
        set({ token: null, user: null, isAuthenticated: false, role: null })
      },
    }),
    {
      name: 'brandmarket-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated, role: state.role }),
    }
  )
)
