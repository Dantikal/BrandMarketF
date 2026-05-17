import api from './client'
import type {
  AuthResponse, LoginRequest, RegisterRequest,
  User, Brand, Product, Comment, Order, ChatMessage, FactoryOrder, Page
} from '../types'

// ─── AUTH ──────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data).then(r => r.data),
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data).then(r => r.data),
}

// ─── USER ──────────────────────────────────────────────────────────────────

export const userApi = {
  me: () =>
    api.get<User>('/users/me').then(r => r.data),
  getById: (id: number) =>
    api.get<User>(`/users/${id}`).then(r => r.data),
  getByUsername: (username: string) =>
    api.get<User>(`/users/username/${username}`).then(r => r.data),
  update: (data: Partial<User>) =>
    api.put<User>('/users/me', data).then(r => r.data),
}

// ─── BRAND ─────────────────────────────────────────────────────────────────

export const brandApi = {
  getAll: () =>
    api.get<Brand[]>('/brands').then(r => r.data),
  getById: (id: number) =>
    api.get<Brand>(`/brands/${id}`).then(r => r.data),
  getByUser: (userId: number) =>
    api.get<Brand[]>(`/brands/user/${userId}`).then(r => r.data),
  create: (data: Partial<Brand>) =>
    api.post<Brand>('/brands', data).then(r => r.data),
  update: (id: number, data: Partial<Brand>) =>
    api.put<Brand>(`/brands/${id}`, data).then(r => r.data),
  delete: (id: number) =>
    api.delete(`/brands/${id}`),
}

// ─── PRODUCT ───────────────────────────────────────────────────────────────

export const productApi = {
  getFeed: (page = 0, size = 10) =>
    api.get<Page<Product>>(`/products/feed?page=${page}&size=${size}`).then(r => r.data),
  getPersonalFeed: (page = 0, size = 10) =>
    api.get<Page<Product>>(`/products/feed/personal?page=${page}&size=${size}`).then(r => r.data),
  getById: (id: number) =>
    api.get<Product>(`/products/${id}`).then(r => r.data),
  getByBrand: (brandId: number) =>
    api.get<Product[]>(`/products/brand/${brandId}`).then(r => r.data),
  search: (q: string) =>
    api.get<Product[]>(`/products/search?q=${encodeURIComponent(q)}`).then(r => r.data),
  create: (data: Partial<Product>) =>
    api.post<Product>('/products', data).then(r => r.data),
  update: (id: number, data: Partial<Product>) =>
    api.put<Product>(`/products/${id}`, data).then(r => r.data),
  delete: (id: number) =>
    api.delete(`/products/${id}`),
}

// ─── SOCIAL ────────────────────────────────────────────────────────────────

export const socialApi = {
  toggleLike: (productId: number) =>
    api.post<{ liked: boolean; likesCount: number }>(`/social/like/${productId}`).then(r => r.data),
  getLikedBy: (productId: number) =>
    api.get<User[]>(`/social/likes/${productId}/users`).then(r => r.data),
  toggleFollow: (userId: number) =>
    api.post<{ following: boolean }>(`/social/follow/${userId}`).then(r => r.data),
  getFollowers: (userId: number) =>
    api.get<User[]>(`/social/followers/${userId}`).then(r => r.data),
  getFollowing: (userId: number) =>
    api.get<User[]>(`/social/following/${userId}`).then(r => r.data),
  addComment: (productId: number, text: string, parentId?: number) =>
    api.post<Comment>(`/social/comment/${productId}`, { text, parentId }).then(r => r.data),
  getComments: (productId: number) =>
    api.get<Comment[]>(`/social/comments/${productId}`).then(r => r.data),
  deleteComment: (commentId: number) =>
    api.delete(`/social/comment/${commentId}`),
}

// ─── ORDERS ────────────────────────────────────────────────────────────────

export const orderApi = {
  create: (data: { productId: number; quantity?: number; size?: string; deliveryAddress?: string; deliveryType?: string }) =>
    api.post<Order>('/orders', data).then(r => r.data),
  getMyOrders: () =>
    api.get<Order[]>('/orders/my').then(r => r.data),
  getById: (id: number) =>
    api.get<Order>(`/orders/${id}`).then(r => r.data),
}

// ─── CHAT ──────────────────────────────────────────────────────────────────

export const chatApi = {
  send: (receiverId: number, message: string, productImageUrl?: string) =>
    api.post<ChatMessage>('/chat/send', { receiverId, message, productImageUrl }).then(r => r.data),
  getConversation: (otherUserId: number) =>
    api.get<ChatMessage[]>(`/chat/conversation/${otherUserId}`).then(r => r.data),
  getUnread: (senderId: number) =>
    api.get<{ unreadCount: number }>(`/chat/unread/${senderId}`).then(r => r.data),
}

// ─── SEARCH ────────────────────────────────────────────────────────────────

export const searchApi = {
  all: (q: string) =>
    api.get<{ products: Product[]; brands: Brand[]; query: string; totalProducts: number; totalBrands: number }>
    (`/search?q=${encodeURIComponent(q)}`).then(r => r.data),
}

// ─── FACTORY (Admin/Worker) ────────────────────────────────────────────────

export const factoryApi = {
  getAll: () =>
    api.get<FactoryOrder[]>('/admin/factory').then(r => r.data),
  getByStage: (stage: string) =>
    api.get<FactoryOrder[]>(`/admin/factory/stage/${stage}`).then(r => r.data),
  create: (data: Partial<FactoryOrder>) =>
    api.post<FactoryOrder>('/admin/factory', data).then(r => r.data),
  moveStage: (id: number, stage: string) =>
    api.patch<FactoryOrder>(`/admin/factory/${id}/stage?stage=${stage}`).then(r => r.data),
  // Worker
  getAvailable: () =>
    api.get<FactoryOrder[]>('/factory/available').then(r => r.data),
  getMy: () =>
    api.get<FactoryOrder[]>('/factory/my').then(r => r.data),
  take: (id: number) =>
    api.post<FactoryOrder>(`/factory/${id}/take`).then(r => r.data),
  complete: (id: number) =>
    api.patch<FactoryOrder>(`/factory/${id}/complete`).then(r => r.data),
}

// ─── NOTIFICATIONS ──────────────────────────────────────────────────────────

export const notificationApi = {
  getAll: () =>
    api.get<any[]>('/notifications').then(r => r.data),
  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count').then(r => r.data),
  markAllRead: () =>
    api.post('/notifications/mark-all-read'),
  markRead: (id: number) =>
    api.post(`/notifications/${id}/read`),
}

// ─── CREATOR ORDERS ─────────────────────────────────────────────────────────

export const creatorApi = {
  getMyOrders: () =>
    api.get<any[]>('/orders/creator').then(r => r.data),
}
