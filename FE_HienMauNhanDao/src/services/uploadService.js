import http from '../utils/http';
import { unwrapData } from '../utils/apiHelper';

export const uploadService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await http.post('/upload/image', formData);
    return unwrapData(res);
  },
};
