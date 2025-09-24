import { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaBook, 
  FaNewspaper, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaImages,
  FaInfoCircle,
  FaYoutube,
  FaUsers
} from 'react-icons/fa';

// Bu fonksiyon gerçek bir auth kontrolü yapmalı
const isAuthenticated = () => {
  const token = localStorage.getItem('adminToken');
  if (!token) return false;

  try {
    const decoded = JSON.parse(atob(token));
    const now = new Date().getTime();
    // Token 24 saat geçerliliğini kontrol et
    if (now - decoded.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('adminToken');
      return false;
    }
    return true;
  } catch {
    localStorage.removeItem('adminToken');
    return false;
  }
};

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [username, setUsername] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        const decoded = JSON.parse(atob(token));
        setUsername(decoded.username);
      }
    } catch (error) {
      console.error('Token çözülemedi:', error);
    }
  }, []);

  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: <FaTachometerAlt />, text: 'Dashboard' },
    { path: '/admin/courses', icon: <FaBook />, text: 'Eğitimler' },
    { path: '/admin/blog', icon: <FaNewspaper />, text: 'Blog Yazıları' },
    { path: '/admin/applications', icon: <FaUsers />, text: 'Kurs Başvuruları' },
    { path: '/admin/youtube', icon: <FaYoutube />, text: 'YouTube', disabled: true },
    { path: '/admin/banner', icon: <FaImages />, text: 'Banner Yönetimi' },
    { path: '/admin/about', icon: <FaInfoCircle />, text: 'Hakkımızda', disabled: true },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className="w-20 hover:w-56 bg-white shadow-lg transition-all duration-300 ease-in-out fixed h-screen z-30 group flex flex-col"
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
      >
        <div className="flex items-center justify-center p-4 border-b h-16">
          <h1 className="text-xl font-bold text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            ABİM Admin
          </h1>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2 p-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                {item.disabled ? (
                  <div
                    className="flex items-center px-4 py-3 text-gray-400 cursor-not-allowed opacity-50"
                  >
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                      {item.text} (Pasif)
                    </span>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                      location.pathname === item.path ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                      {item.text}
                    </span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-20 transition-all duration-300">
        <header className="bg-white shadow-sm fixed right-0 left-0 z-20">
          <div className="h-16 px-6 pr-8 flex justify-between items-center ml-20 transition-all duration-300">
            <h2 className="text-xl font-semibold text-gray-800">
              {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Hoş geldin, {username}</span>
              <button 
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FaSignOutAlt className="mr-2" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </header>

        <main className="px-6 py-6 mt-16 pr-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 