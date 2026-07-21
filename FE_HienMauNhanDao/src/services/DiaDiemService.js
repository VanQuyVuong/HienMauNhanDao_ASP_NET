import http from "../utils/http";

export const DiaDiemService = {
    getDiaDiems: () => http.get('/diadiem'),
    getDiaDiemById: (id) => http.get(`/diadiem/${id}`),
    createDiaDiem: (data) => http.post('/diadiem', data),
    updateDiaDiem: (id, data) => http.put(`/diadiem/${id}`, data),
    deleteDiaDiem: (id) => http.delete(`/diadiem/${id}`),
};