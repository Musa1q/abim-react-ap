// İstatistikler servisi - Backend API ile çalışır
const API_BASE_URL = 'http://localhost:5000/api';

export const getStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data.stats;
  } catch (error) {
    console.error('İstatistikler yüklenirken hata:', error);
    throw new Error('İstatistikler yüklenirken bir hata oluştu');
  }
};

export const getActivities = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/activities`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data.activities;
  } catch (error) {
    console.error('Aktiviteler yüklenirken hata:', error);
    throw new Error('Aktiviteler yüklenirken bir hata oluştu');
  }
};
