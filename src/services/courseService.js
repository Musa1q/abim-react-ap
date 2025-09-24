// Course servisi - Backend API ile çalışır
const API_BASE_URL = 'http://localhost:5000/api';

export const getCourses = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data.courses;
  } catch (error) {
    console.error('Kurslar yüklenirken hata:', error);
    throw new Error('Kurslar yüklenirken bir hata oluştu');
  }
};

export const getCourseById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data.course;
  } catch (error) {
    console.error('Kurs yüklenirken hata:', error);
    throw new Error('Kurs yüklenirken bir hata oluştu');
  }
};

export const addCourse = async (course) => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(course),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data.course.id;
  } catch (error) {
    console.error('Kurs ekleme hatası:', error);
    throw new Error('Kurs eklenirken bir hata oluştu');
  }
};

export const updateCourse = async (id, course) => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(course),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data.course;
  } catch (error) {
    console.error('Kurs güncelleme hatası:', error);
    throw new Error('Kurs güncellenirken bir hata oluştu');
  }
};

export const deleteCourse = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return true;
  } catch (error) {
    console.error('Kurs silme hatası:', error);
    throw new Error('Kurs silinirken bir hata oluştu');
  }
};

export const getAllCourses = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/courses`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data.courses;
  } catch (error) {
    console.error('Tüm kurslar yüklenirken hata:', error);
    throw new Error('Tüm kurslar yüklenirken bir hata oluştu');
  }
};
  