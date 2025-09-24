import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaSpinner, FaUpload, FaPlus, FaTrash } from 'react-icons/fa';
import { uploadImage } from '../../services/uploadService';
import RichTextEditor from '../../components/RichTextEditor';

const AboutEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    icon: '',
    order: 1
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchSection();
    }
  }, [id]);

  const fetchSection = async () => {
    try {
      setIsLoading(true);
      // Mock data - gerçek uygulamada API'den gelecek
      const mockSection = {
        id: id,
        title: 'Örnek Bölüm',
        content: 'Bu bölümün içeriği...',
        imageUrl: '/about/abim-logo.png',
        icon: 'FaUsers',
        order: 1
      };
      setFormData(mockSection);
    } catch (error) {
      console.error('Bölüm yüklenirken hata:', error);
      setError('Bölüm yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Sadece JPEG, PNG ve WEBP formatları desteklenir.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const path = `about/${Date.now()}_${file.name}`;
      const imageUrl = await uploadImage(file, path);
      setFormData({ ...formData, imageUrl });
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      setError('Resim yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.imageUrl) {
      setError('Lütfen bir resim yükleyin.');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      
      // Mock save - gerçek uygulamada API'ye gönderilecek
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/admin/about');
    } catch (error) {
      console.error('Bölüm kaydedilirken hata:', error);
      setError('Bölüm kaydedilirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/about')}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Geri Dön
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {isEdit ? 'Bölümü Düzenle' : 'Yeni Bölüm Ekle'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEdit ? 'Mevcut bölümü güncelleyin' : 'Hakkımızda sayfasına yeni bölüm ekleyin'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Temel Bilgiler */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-3">
              Temel Bilgiler
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bölüm Başlığı *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Bölüm başlığını girin"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sıra *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                  placeholder="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İkon (FontAwesome sınıfı)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="Örn: FaUsers, FaRocket, FaLightbulb"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bölüm İçeriği *
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Bölüm içeriğini yazın... Formatlamaları kullanabilirsiniz."
              />
            </div>
          </div>

          {/* Resim Yükleme */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-3">
              Bölüm Resmi
            </h2>
            
            <div className="flex items-start space-x-6">
              {formData.imageUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={formData.imageUrl}
                    alt="Bölüm resmi"
                    className="h-32 w-48 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
              
              <div className="flex-1">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaUpload className="w-8 h-8 mb-4 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Resim seçmek için tıklayın</span>
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 10MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                  />
                </label>
                
                {isLoading && (
                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <FaSpinner className="animate-spin h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Resim yükleniyor...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hata Mesajı */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Butonlar */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin/about')}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>{isEdit ? 'Güncelle' : 'Kaydet'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AboutEditPage;
