import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import Navbar from './components/layout/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import FeedPage from './pages/feed/FeedPage'
import ProfilePage from './pages/profile/ProfilePage'
import EditProfilePage from './pages/profile/EditProfilePage'
import BrandPage from './pages/brand/BrandPage'
import BrandCreatePage from './pages/brand/BrandCreatePage'
import ProductPage from './pages/product/ProductPage'
import ProductCreatePage from './pages/product/ProductCreatePage'
import SearchPage from './pages/SearchPage'
import OrdersPage from './pages/OrdersPage'
import AdminPage from './pages/admin/AdminPage'
import ChatPage from './pages/ChatPage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import CheckoutPage from './pages/checkout/CheckoutPage'
import CreatorDashboardPage from './pages/creator/CreatorDashboardPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return <><Navbar /><main>{children}</main></>
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{
        style: { background: 'var(--cream)', color: 'var(--choco)', border: '1px solid var(--border)', fontFamily: 'var(--font-body)', borderRadius: 12 },
        success: { iconTheme: { primary: 'var(--saffron)', secondary: 'var(--cream)' } },
      }} />
      <Routes>
        {/* No navbar */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/feed" element={<FeedPage />} />

        {/* Public */}
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/profile/:username" element={<MainLayout><ProfilePage /></MainLayout>} />
        <Route path="/brand/:id" element={<MainLayout><BrandPage /></MainLayout>} />
        <Route path="/product/:id" element={<MainLayout><ProductPage /></MainLayout>} />
        <Route path="/search" element={<MainLayout><SearchPage /></MainLayout>} />

        {/* Protected */}
        <Route path="/profile/edit" element={<PrivateRoute><MainLayout><EditProfilePage /></MainLayout></PrivateRoute>} />
        <Route path="/brand/create" element={<PrivateRoute><MainLayout><BrandCreatePage /></MainLayout></PrivateRoute>} />
        <Route path="/product/create" element={<PrivateRoute><MainLayout><ProductCreatePage /></MainLayout></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><MainLayout><OrdersPage /></MainLayout></PrivateRoute>} />
        <Route path="/chat/:userId?" element={<PrivateRoute><MainLayout><ChatPage /></MainLayout></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><MainLayout><AdminPage /></MainLayout></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><MainLayout><NotificationsPage /></MainLayout></PrivateRoute>} />
        <Route path="/checkout" element={<PrivateRoute><MainLayout><CheckoutPage /></MainLayout></PrivateRoute>} />
        <Route path="/creator" element={<PrivateRoute><MainLayout><CreatorDashboardPage /></MainLayout></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
