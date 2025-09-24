import React, { useState, useEffect } from 'react';
import { getCourses } from '../../services/courseService';
import { submitCourseApplication } from '../../services/courseApplicationService';
import { sendEmail } from '../../utils/sendEmail';

const ApplicationModal = ({ show, handleClose, courseId }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    courseId: courseId || '',
    notes: ''
  });
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (show) {
      fetchCourses();
      // Kurs seçimini otomatik yap
      if (courseId) {
        setFormData(prev => ({ ...prev, courseId }));
      }
    }
  }, [show, courseId]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const coursesData = await getCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Kurslar yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Önce veritabanına kaydet
      const applicationResult = await submitCourseApplication({
        courseId: parseInt(formData.courseId),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes
      });

      if (applicationResult.success) {
        // Başarılı kayıt sonrası email gönder (geçici olarak devre dışı)
        try {
          const selectedCourse = courses.find(c => c.id === parseInt(formData.courseId));
          
          await sendEmail({
            ...formData,
            courseName: selectedCourse ? selectedCourse.mainTitle : 'Belirtilmemiş',
            type: 'application',
          });
        } catch (emailError) {
          console.warn('Email gönderme hatası:', emailError);
          // Email hatası olsa da devam et
        }

        alert(applicationResult.message);
        handleClose();
        // Formu temizle
        setFormData({
          name: '',
          email: '',
          phone: '',
          courseId: courseId || '',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Başvuru gönderme hatası:', error);
      console.error('Hata detayı:', error);
      alert(`Hata: ${error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.'}`);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/[.10] backdrop-blur-[1px] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Kurs Başvuru Formu</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kurs Seçimi
            </label>
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="">Kurs Seçiniz</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.mainTitle}
                </option>
              ))}
            </select>
            {isLoading && (
              <p className="text-sm text-gray-500 mt-1">Kurslar yükleniyor...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ad Soyad
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-posta
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notlar
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Başvuruyu Gönder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationModal; 