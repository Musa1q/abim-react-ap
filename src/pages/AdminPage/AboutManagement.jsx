import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaUpload, FaSpinner, FaSave } from 'react-icons/fa';
import { uploadImage } from '../../services/uploadService';
import RichTextEditor from '../../components/RichTextEditor';

const AboutManagement = () => {
  const navigate = useNavigate();
  const [aboutData, setAboutData] = useState({
    mainTitle: '',
    mainContent: '',
    sections: []
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAboutData();
  }, []);

  const loadAboutData = async () => {
    setIsLoading(true);
    // Mock data - gerçek uygulamada API'den gelecek
    const mockData = {
      mainTitle: 'ABİM Hakkında',
      mainContent: 'Adana Bilim ve İnovasyon Merkezi olarak, gençlerin teknoloji alanında kendilerini geliştirmelerine yardımcı oluyoruz.',
      sections: []
    };

    setTimeout(() => {
      setAboutData(mockData);
      setIsLoading(false);
    }, 100);
  };

  const handleMainSave = async () => {
    // Ana başlık ve içerik kaydetme
    console.log('Ana içerik kaydediliyor:', aboutData);
    alert('Ana içerik başarıyla kaydedildi!');
  };

  const handleSectionDelete = async (id) => {
    if (window.confirm('Bu bölümü silmek istediğinizden emin misiniz?')) {
      setAboutData({
        ...aboutData,
        sections: aboutData.sections.filter(s => s.id !== id)
      });
    }
  };

  const handleEdit = (section) => {
    navigate(`/admin/about/edit/${section.id}`);
  };

  const handleNewSection = () => {
    navigate('/admin/about/new');
  };

  if (isLoading && !aboutData.mainTitle) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-2xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Ana İçerik */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Ana İçerik</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ana Başlık
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={aboutData.mainTitle}
              onChange={(e) => setAboutData({ ...aboutData, mainTitle: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ana İçerik
            </label>
            <RichTextEditor
              value={aboutData.mainContent}
              onChange={(content) => setAboutData({ ...aboutData, mainContent: content })}
              placeholder="Ana içeriği yazın..."
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleMainSave}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaSave className="mr-2" />
              Ana İçeriği Kaydet
            </button>
          </div>
        </div>
      </div>

      {/* Bölümler */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Bölümler</h2>
          <button
            onClick={handleNewSection}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Yeni Bölüm
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aboutData.sections.map((section) => (
            <div key={section.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{section.icon}</span>
                  <h3 className="font-semibold text-gray-800">{section.title}</h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(section)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleSectionDelete(section.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              {section.imageUrl && (
                <img
                  src={section.imageUrl}
                  alt={section.title}
                  className="w-full h-32 object-cover rounded mb-3"
                />
              )}
              
              <div 
                className="text-sm text-gray-600 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AboutManagement;
