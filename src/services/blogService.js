// Blog servisi - Backend API ile çalışır
const API_BASE_URL = 'http://localhost:5000/api';

export const getBlogs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data.data;
  } catch (error) {
    console.error('Bloglar yüklenirken hata:', error);
    throw new Error('Bloglar yüklenirken bir hata oluştu');
  }
};

export const getBlogById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data.data;
  } catch (error) {
    console.error('Blog yüklenirken hata:', error);
    throw new Error('Blog yüklenirken bir hata oluştu');
  }
};

export const addBlog = async (blog) => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blog),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data;
  } catch (error) {
    console.error('Blog ekleme hatası:', error);
    throw new Error('Blog eklenirken bir hata oluştu');
  }
};
  
export const updateBlog = async (id, blog) => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blog),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data;
  } catch (error) {
    console.error('Blog güncelleme hatası:', error);
    throw new Error('Blog güncellenirken bir hata oluştu');
  }
};

export const deleteBlog = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return true;
  } catch (error) {
    console.error('Blog silme hatası:', error);
    throw new Error('Blog silinirken bir hata oluştu');
  }
};
  