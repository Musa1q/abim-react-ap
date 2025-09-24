import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaBook, 
  FaNewspaper, 
  FaChartLine, 
  FaEye, 
  FaEdit, 
  FaPlus,
  FaArrowRight,
  FaCalendarAlt,
  FaComments,
  FaGraduationCap
} from 'react-icons/fa';
import { getCourses } from '../../services/courseService';
import { getStats, getActivities } from '../../services/statsService';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalBlogs: 0,
    totalViews: 0,
    studentGrowthRate: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivityCount, setLastActivityCount] = useState(0);
  const [hasNewActivity, setHasNewActivity] = useState(false);

  // Bildirim fonksiyonları
  const showNotification = (title, message) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/abim-logo.png',
        badge: '/abim-logo.png'
      });
    }
  };

  const playNotificationSound = () => {
    // Basit bir bildirim sesi oluştur
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  // Bildirim izni iste
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Otomatik güncelleme interval'ı
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 30000); // 30 saniyede bir güncelle

    return () => clearInterval(interval);
  }, [lastActivityCount]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      // Aktif kurs sayısını çek
      const courses = await getCourses();
      const activeCoursesCount = courses.length;

      // Gerçek verileri çek
      const realStats = await getStats();
      const realActivities = await getActivities();
      
      const statsData = {
        totalStudents: realStats.students,
        totalCourses: activeCoursesCount,
        totalBlogs: realStats.blogs,
        totalViews: 2847,
        studentGrowthRate: realStats.studentGrowthRate
      };

      // Aktiviteleri icon mapping ile dönüştür
      const activitiesWithIcons = realActivities.map(activity => ({
        ...activity,
        icon: activity.icon === 'FaUsers' ? FaUsers : 
              activity.icon === 'FaNewspaper' ? FaNewspaper : 
              activity.icon === 'FaBook' ? FaBook : FaEye
      }));

      setStats(statsData);
      setRecentActivities(activitiesWithIcons);
      
      // Yeni aktivite kontrolü
      if (activitiesWithIcons.length > lastActivityCount && lastActivityCount > 0) {
        // Yeni aktivite var, bildirim göster
        showNotification('Yeni aktivite!', 'Yeni bir aktivite eklendi.');
        playNotificationSound();
        setHasNewActivity(true);
        
        // 5 saniye sonra yeni aktivite göstergesini kaldır
        setTimeout(() => setHasNewActivity(false), 5000);
      }
      setLastActivityCount(activitiesWithIcons.length);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
      // Hata durumunda mock data kullan
      const mockStats = {
        totalStudents: 156,
        totalCourses: 0,
        totalBlogs: 0,
        totalViews: 2847
      };
      
      const mockActivities = [
        {
          id: 1,
          type: 'student',
          message: 'Yeni öğrenci kaydı: Ahmet Yılmaz',
          time: '2 saat önce',
          icon: FaUsers,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50'
        },
        {
          id: 2,
          type: 'blog',
          message: 'Yeni blog yazısı yayınlandı: "React Hooks"',
          time: '4 saat önce',
          icon: FaNewspaper,
          color: 'text-green-500',
          bgColor: 'bg-green-50'
        }
      ];
      
      setStats(mockStats);
      setRecentActivities(mockActivities);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statsCards = [
    {
      title: 'Toplam Öğrenci',
      value: stats.totalStudents,
      icon: FaUsers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: stats.studentGrowthRate > 0 ? `+${stats.studentGrowthRate}%` : `${stats.studentGrowthRate}%`,
      changeType: stats.studentGrowthRate >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Aktif Kurslar',
      value: stats.totalCourses,
      icon: FaBook,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+2',
      changeType: 'positive'
    },
    {
      title: 'Blog Yazıları',
      value: stats.totalBlogs,
      icon: FaNewspaper,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+5',
      changeType: 'positive'
    },
    {
      title: 'Toplam Görüntülenme',
      value: stats.totalViews.toLocaleString(),
      icon: FaEye,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+18%',
      changeType: 'positive'
    }
  ];

  const quickActions = [
    {
      title: 'Yeni Blog Yazısı',
      description: 'Blog yazısı ekle ve yayınla',
      icon: FaPlus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/admin/blog'
    },
    {
      title: 'Kurs Ekle',
      description: 'Yeni eğitim kursu oluştur',
      icon: FaGraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/admin/courses'
    },
    {
      title: 'Öğrenci Yönetimi',
      description: 'Öğrenci kayıtlarını yönet',
      icon: FaUsers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/admin/students'
    },
    {
      title: 'Site İstatistikleri',
      description: 'Detaylı analiz ve raporlar',
      icon: FaChartLine,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      link: '/admin/analytics'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hoş Geldin Mesajı */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Hoş Geldiniz! 👋</h1>
        <p className="text-blue-100 text-lg">
          ABİM Admin Paneline hoş geldiniz. Buradan tüm içerikleri yönetebilirsiniz.
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">bu ay</span>
                </div>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hızlı İşlemler */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Hızlı İşlemler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="group p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start space-x-3">
                  <div className={`${action.bgColor} p-2 rounded-lg`}>
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                  </div>
                  <FaArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Son Aktiviteler */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Son Aktiviteler</h2>
            {hasNewActivity && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Yeni!</span>
              </div>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`${activity.bgColor} p-2 rounded-lg`}>
                  <activity.icon className={`h-4 w-4 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p 
                    className="text-sm text-gray-900"
                    dangerouslySetInnerHTML={{ __html: activity.message }}
                  ></p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              to="/admin/activities"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              Tüm aktiviteleri görüntüle
              <FaArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Alt İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Bu Ay Yeni Kayıtlar</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">23</p>
            </div>
            <FaCalendarAlt className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Toplam Öğrenci</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalStudents}</p>
            </div>
            <FaUsers className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 