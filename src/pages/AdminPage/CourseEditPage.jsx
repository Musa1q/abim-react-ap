import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaTrash, FaUpload, FaSave, FaSpinner } from 'react-icons/fa';
import { uploadImage } from '../../services/uploadService';
import { getCourseById, addCourse, updateCourse } from '../../services/courseService';
import RichTextEditor from '../../components/RichTextEditor';

const CourseEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    mainTitle: '',
    subtitle: '',
    imageUrl: '',
    dersGunleri: [], 
    dersSaati: '',
    content: {
      egitimSuresi: [
        { "Başlangıç": "" },
        { "Bitiş": "" }
      ],
      mufredat: []
    }
  });
  const [newCurriculumItem, setNewCurriculumItem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const course = await getCourseById(id);
      if (course) {
        // Backend zaten doğru formatta veri gönderiyor
        setFormData(course);
      }
    } catch (error) {
      console.error('Kurs yüklenirken hata:', error);
      setError('Kurs yüklenirken bir hata oluştu.');
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
      const path = `courses/${Date.now()}_${file.name}`;
      const imageUrl = await uploadImage(file, path);
      setFormData({ ...formData, imageUrl });
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      setError('Resim yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCurriculumItem = () => {
    if (newCurriculumItem.trim()) {
      setFormData({
        ...formData,
        content: {
          ...formData.content,
          mufredat: [...formData.content.mufredat, newCurriculumItem.trim()]
        }
      });
      setNewCurriculumItem('');
    }
  };

  const handleRemoveCurriculumItem = (index) => {
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        mufredat: formData.content.mufredat.filter((_, i) => i !== index)
      }
    });
  };

  const handleDayChange = (day) => {
    setFormData(prev => ({
      ...prev,
      dersGunleri: prev.dersGunleri.includes(day)
        ? prev.dersGunleri.filter(d => d !== day)
        : [...prev.dersGunleri, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.imageUrl) {
      setError('Lütfen bir resim yükleyin.');
      return;
    }

    if (formData.dersGunleri.length === 0) {
      setError('En az bir ders günü seçmelisiniz.');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      
      // Form verisini backend formatına dönüştür
      const courseData = {
        mainTitle: formData.mainTitle,
        subtitle: formData.subtitle,
        imageUrl: formData.imageUrl,
        dersGunleri: formData.dersGunleri,
        dersSaati: formData.dersSaati,
        content: {
          egitimSuresi: formData.content.egitimSuresi,
          mufredat: formData.content.mufredat
        }
      };
      
      if (isEdit) {
        await updateCourse(id, courseData);
      } else {
        await addCourse(courseData);
      }
      
      navigate('/admin/courses');
    } catch (error) {
      console.error('Kurs kaydedilirken hata:', error);
      setError('Kurs kaydedilirken bir hata oluştu.');
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
            onClick={() => navigate('/admin/courses')}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Geri Dön
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {isEdit ? 'Kursu Düzenle' : 'Yeni Kurs Ekle'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEdit ? 'Mevcut kurs bilgilerini güncelleyin' : 'Yeni bir kurs oluşturun'}
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
                  Kurs Adı *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={formData.mainTitle}
                  onChange={(e) => setFormData({ ...formData, mainTitle: e.target.value })}
                  placeholder="Örn: React ile Modern Web Geliştirme"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ders Saati *
                </label>
                <input
                  type="time"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={formData.dersSaati}
                  onChange={(e) => setFormData({ ...formData, dersSaati: e.target.value })}
                />
              </div>
            </div>

            {/* Ders Günleri - Checkbox'lar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ders Günleri * (Birden fazla seçebilirsiniz)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map((day) => (
                  <label key={day} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.dersGunleri.includes(day)}
                      onChange={() => handleDayChange(day)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">{day}</span>
                  </label>
                ))}
              </div>
              {formData.dersGunleri.length === 0 && (
                <p className="text-red-500 text-sm mt-2">En az bir gün seçmelisiniz</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kurs Açıklaması
              </label>
              <RichTextEditor
                value={formData.subtitle}
                onChange={(subtitle) => setFormData({ ...formData, subtitle })}
                placeholder="Kurs hakkında detaylı bilgi verin... Formatlamaları kullanabilirsiniz."
              />
            </div>
          </div>

          {/* Resim Yükleme */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-3">
              Kurs Resmi
            </h2>
            
            <div className="flex items-start space-x-6">
              {formData.imageUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={formData.imageUrl}
                    alt="Kurs resmi"
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

          {/* Eğitim Süresi */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-3">
              Eğitim Süresi
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlangıç Tarihi *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={formData.content.egitimSuresi[0]["Başlangıç"]}
                  onChange={(e) => setFormData({
                    ...formData,
                    content: {
                      ...formData.content,
                      egitimSuresi: [
                        { "Başlangıç": e.target.value },
                        formData.content.egitimSuresi[1]
                      ]
                    }
                  })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bitiş Tarihi *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={formData.content.egitimSuresi[1]["Bitiş"]}
                  onChange={(e) => setFormData({
                    ...formData,
                    content: {
                      ...formData.content,
                      egitimSuresi: [
                        formData.content.egitimSuresi[0],
                        { "Bitiş": e.target.value }
                      ]
                    }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Müfredat */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-3">
              Müfredat
            </h2>
            
            <div className="space-y-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newCurriculumItem}
                  onChange={(e) => setNewCurriculumItem(e.target.value)}
                  placeholder="Yeni müfredat konusu ekle"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCurriculumItem()}
                />
                <button
                  type="button"
                  onClick={handleAddCurriculumItem}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <FaPlus />
                  <span>Ekle</span>
                </button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {formData.content.mufredat.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{item}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCurriculumItem(index)}
                      className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
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
              onClick={() => navigate('/admin/courses')}
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

export default CourseEditPage;
