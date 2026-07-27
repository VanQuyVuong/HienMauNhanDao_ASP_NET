import http from "../utils/http";
import { unwrapList, unwrapData } from "../utils/apiHelper";

const unwrap = (res) => unwrapData(res);

export const chienDichService = {
    getChienDichs: () => http.get('/chiendich'),
    getChienDichsList: async () => unwrapList(await http.get('/chiendich')),
    getChienDichById: async (id) => unwrap(await http.get(`/chiendich/${id}`)),
    createChienDich: async (data) => unwrap(await http.post('/chiendich', data)),
    updateChienDich: async (id, data) => unwrap(await http.put(`/chiendich/${id}`, data)),
    deleteChienDich: async (id) => http.delete(`/chiendich/${id}`),
};

export const diaDiemService = {
    getAll: async () => unwrapList(await http.get('/diadiem')),
    createDiaDiem: async (data) => unwrap(await http.post('/diadiem', data)),
};