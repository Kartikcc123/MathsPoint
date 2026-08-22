import axios from 'axios';

const API_URL = import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://mathspoint-yqnv.onrender.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const getAdvertisements = async (params = {}) => {
  const response = await axios.get(`${API_URL}/advertisements/admin`, {
    ...getAuthHeaders(),
    params
  });
  return response.data;
};

export const getPublicAdvertisements = async () => {
  const response = await axios.get(`${API_URL}/advertisements/public`);
  return response.data;
};

export const createAdvertisement = async (formData) => {
  const response = await axios.post(`${API_URL}/advertisements/admin`, formData, {
    headers: {
      ...getAuthHeaders().headers,
      'Content-Type': 'multipart/form-data',
    }
  });
  return response.data;
};

export const updateAdvertisement = async (id, formData) => {
  const response = await axios.put(`${API_URL}/advertisements/admin/${id}`, formData, {
    headers: {
      ...getAuthHeaders().headers,
      'Content-Type': 'multipart/form-data',
    }
  });
  return response.data;
};

export const deleteAdvertisement = async (id) => {
  const response = await axios.delete(`${API_URL}/advertisements/admin/${id}`, getAuthHeaders());
  return response.data;
};

export const trackImpression = async (id) => {
  try {
    await axios.post(`${API_URL}/advertisements/track/impression`, { id });
  } catch (error) {
    // Ignore error for analytics tracking
  }
};

export const trackClick = async (id) => {
  try {
    await axios.post(`${API_URL}/advertisements/track/click`, { id });
  } catch (error) {
    // Ignore error for analytics tracking
  }
};
