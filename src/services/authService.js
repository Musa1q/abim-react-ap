// Backend API ile giriş
const API_BASE_URL = 'http://localhost:5000/api';

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.user;
  } catch (error) {
    console.error('Giriş hatası:', error);
    throw new Error(error.message || 'Giriş yapılırken bir hata oluştu');
  }
};
