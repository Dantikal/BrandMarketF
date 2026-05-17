// ─── Auth ──────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string
  userId: number
  email: string
  username: string
  name: string
  avatar: string | null
  role: Role
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  username: string
}

export interface LoginRequest {
  email: string
  password: string
}

// ─── Enums ─────────────────────────────────────────────────────────────────

export type Role = 'GUEST' | 'USER' | 'CREATOR' | 'WORKER' | 'ADMIN'
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PRINTING' | 'SEWING' | 'PACKAGING' | 'READY' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type FactoryStage = 'NEW' | 'IN_PROGRESS' | 'PRINTING' | 'SEWING' | 'DONE'

// ─── User ──────────────────────────────────────────────────────────────────

export interface User {
  id: number
  email: string
  username: string
  name: string
  avatar: string | null
  bio: string | null
  role: Role
  tiktokLink: string | null
  instagramLink: string | null
  facebookLink: string | null
  followersCount: number
  followingCount: number
  likesCount: number
  isFollowing: boolean
}

// ─── Brand ─────────────────────────────────────────────────────────────────

export interface Brand {
  id: number
  name: string
  type: string | null
  color: string | null
  description: string | null
  logo: string | null
  print: string | null
  positioning: string | null
  history: string | null
  uniqueness: string | null
  quality: string | null
  minQuantity: number
  ownerId: number
  ownerUsername: string
  ownerAvatar: string | null
  productCount: number
  createdAt: string
}

// ─── Product ───────────────────────────────────────────────────────────────

export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  size: string | null
  clothingType: string | null
  model3dUrl: string | null
  images: string[]
  color: string | null
  stock: number
  brandId: number
  brandName: string
  brandLogo: string | null
  ownerId: number
  ownerUsername: string
  likesCount: number
  commentsCount: number
  isLiked: boolean
  createdAt: string
}

// ─── Comment ───────────────────────────────────────────────────────────────

export interface Comment {
  id: number
  text: string
  userId: number
  username: string
  userAvatar: string | null
  productId: number
  parentId: number | null
  replies: Comment[]
  likesCount: number
  createdAt: string
}

// ─── Order ─────────────────────────────────────────────────────────────────

export interface Order {
  id: number
  userId: number
  username: string
  productId: number
  productName: string
  productImage: string | null
  brandName: string
  quantity: number
  totalPrice: number
  size: string | null
  status: OrderStatus
  deliveryAddress: string | null
  deliveryType: string
  estimatedDeliveryDate: string
  createdAt: string
}

// ─── Chat ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: number
  senderId: number
  senderUsername: string
  senderAvatar: string | null
  receiverId: number
  receiverUsername: string
  message: string
  productImageUrl: string | null
  isRead: boolean
  timestamp: string
}

// ─── Factory ───────────────────────────────────────────────────────────────

export interface FactoryOrder {
  id: number
  brandId: number
  brandName: string
  brandLogo: string | null
  quantity: number
  clothingType: string | null
  color: string | null
  printUrl: string | null
  size: string | null
  stage: FactoryStage
  deadline: string | null
  workerId: number | null
  workerUsername: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}

// ─── API Pagination ────────────────────────────────────────────────────────

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  last: boolean
}
