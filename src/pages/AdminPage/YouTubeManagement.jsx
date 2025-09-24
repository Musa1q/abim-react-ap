import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaPlay, FaCalendarAlt, FaEye, FaThumbsUp, FaSpinner, FaYoutube } from 'react-icons/fa';

const YouTubeManagement = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setIsLoading(true);
    // Mock data - gerçek uygulamada API'den gelecek
    const mockVideos = [
      {
        id: '1',
        title: 'HTML & CSS Temelleri - Web Geliştirmeye Giriş',
        description: 'Bu videoda HTML ve CSS\'in temel kavramlarını öğreneceksiniz. Web geliştirmeye başlamak için mükemmel bir başlangıç!',
        videoId: 'dQw4w9WgXcQ',
        thumbnailUrl: '/youtube/html-css-thumb.webp',
        category: 'Web Geliştirme',
        tags: 'html, css, web geliştirme, başlangıç',
        publishDate: '2024-01-15',
        duration: '15:30',
        views: 1250,
        likes: 89,
        isPublished: true,
        isFeatured: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'JavaScript Fonksiyonları - Detaylı Anlatım',
        description: 'JavaScript\'te fonksiyonlar nasıl çalışır? Arrow functions, callback functions ve daha fazlası bu videoda!',
        videoId: 'dQw4w9WgXcQ',
        thumbnailUrl: '/youtube/js-functions-thumb.webp',
        category: 'JavaScript',
        tags: 'javascript, fonksiyonlar, programlama',
        publishDate: '2024-01-20',
        duration: '22:45',
        views: 2100,
        likes: 156,
        isPublished: true,
        isFeatured: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        title: 'React Hooks - useState ve useEffect',
        description: 'React Hooks\'un en önemli iki hook\'u: useState ve useEffect. Pratik örneklerle öğrenin!',
        videoId: 'dQw4w9WgXcQ',
        thumbnailUrl: '/youtube/react-hooks-thumb.webp',
        category: 'React',
        tags: 'react, hooks, useState, useEffect',
        publishDate: '2024-01-25',
        duration: '18:20',
        views: 3200,
        likes: 234,
        isPublished: true,
        isFeatured: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        title: 'Node.js ile Backend Geliştirme',
        description: 'Node.js kullanarak backend API nasıl geliştirilir? Express.js ile RESTful API oluşturma.',
        videoId: 'dQw4w9WgXcQ',
        thumbnailUrl: '/youtube/nodejs-thumb.webp',
        category: 'Backend',
        tags: 'nodejs, express, api, backend',
        publishDate: '2024-01-30',
        duration: '25:10',
        views: 1800,
        likes: 98,
        isPublished: false,
        isFeatured: false,
        createdAt: new Date().toISOString()
      }
    ];

    setTimeout(() => {
      setVideos(mockVideos.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate)));
      setIsLoading(false);
    }, 100);
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Sadece JPEG, PNG ve WEBP formatları desteklenir.');
      return;
    }

    try {
      setIsLoading(true);
      const path = `youtube/thumbnails/${Date.now()}_${file.name}`;
      const thumbnailUrl = await uploadImage(file, path);
      setFormData({ ...formData, thumbnailUrl });
    } catch (error) {
      console.error('Thumbnail yükleme hatası:', error);
      alert('Thumbnail yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleDelete = async (id) => {
    if (window.confirm('Bu videoyu silmek istediğinizden emin misiniz?')) {
      setVideos(videos.filter(v => v.id !== id));
    }
  };

  const handleEdit = (video) => {
    navigate(`/admin/youtube/edit/${video.id}`);
  };

  const handleNewVideo = () => {
    navigate('/admin/youtube/new');
  };

  const getYouTubeEmbedUrl = (videoId) => {
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const getYouTubeThumbnailUrl = (videoId) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  if (isLoading && videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-2xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <FaYoutube className="text-red-600 text-3xl" />
          <h1 className="text-2xl font-bold text-gray-800">YouTube Yönetimi</h1>
        </div>
        <button
          onClick={handleNewVideo}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <FaPlus className="mr-2" />
          Yeni Video
        </button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Toplam Video</p>
              <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
            </div>
            <FaPlay className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Toplam İzlenme</p>
              <p className="text-2xl font-bold text-gray-900">
                {videos.reduce((sum, video) => sum + video.views, 0).toLocaleString()}
              </p>
            </div>
            <FaEye className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Toplam Beğeni</p>
              <p className="text-2xl font-bold text-gray-900">
                {videos.reduce((sum, video) => sum + video.likes, 0).toLocaleString()}
              </p>
            </div>
            <FaThumbsUp className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Öne Çıkan</p>
              <p className="text-2xl font-bold text-gray-900">
                {videos.filter(video => video.isFeatured).length}
              </p>
            </div>
            <FaYoutube className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Video Listesi */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Thumbnail
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Video Bilgileri
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Kategori
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  İzlenme
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Beğeni
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Durum
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {videos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Henüz video bulunmuyor.
                  </td>
                </tr>
              ) : (
                videos.map((video) => (
                  <tr key={video.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <img
                        src={video.thumbnailUrl || getYouTubeThumbnailUrl(video.videoId)}
                        alt={video.title}
                        className="h-16 w-24 object-cover rounded"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {video.title}
                            </h3>
                            {video.isFeatured && (
                              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                Öne Çıkan
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <FaCalendarAlt className="mr-1" />
                              {new Date(video.publishDate).toLocaleDateString('tr-TR')}
                            </span>
                            <span className="flex items-center">
                              <FaPlay className="mr-1" />
                              {video.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {video.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {video.views.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {video.likes.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        video.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {video.isPublished ? 'Yayında' : 'Taslak'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(video)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <FaEdit className="inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default YouTubeManagement;

