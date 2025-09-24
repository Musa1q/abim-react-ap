// Kurs başvuru servisi - Backend API ile çalışır
const API_BASE_URL = 'http://localhost:5000/api';

export const getCourseApplications = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/course-applications`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data.applications;
  } catch (error) {
    console.error('Kurs başvuruları yüklenirken hata:', error);
    throw new Error('Kurs başvuruları yüklenirken bir hata oluştu');
  }
};

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
    console.error('Kurs başvurusu gönderme hatası:', error);
    throw new Error('Kurs başvurusu gönderilirken bir hata oluştu');
  }
};

export const updateApplicationStatus = async (applicationId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/course-applications/${applicationId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data;
  } catch (error) {
    console.error('Durum güncelleme hatası:', error);
    throw new Error('Durum güncellenirken bir hata oluştu');
  }
};