import api from '../services/api';

export const resolveMediaUrl = (fileUrl) => {
  if (!fileUrl) {
    return '';
  }

  if (/^(https?:)?\/\//i.test(fileUrl) || fileUrl.startsWith('data:') || fileUrl.startsWith('blob:')) {
    return fileUrl;
  }

  const base = api.defaults.baseURL || '';

  try {
    const origin = new URL(base).origin;
    return `${origin}${fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`}`;
  } catch (_error) {
    return fileUrl;
  }
};

export default resolveMediaUrl;
