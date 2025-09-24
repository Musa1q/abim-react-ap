// Kurs başvuru servisi - Backend API ile çalışır
const API_BASE_URL = 'http://localhost:5000/api';

export const submitCourseApplication = async (applicationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/course-applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data;
  } catch (error) {
    console.error('Kurs başvuru hatası:', error);
    throw new Error(error.message || 'Başvuru gönderilirken bir hata oluştu');
  }
};

