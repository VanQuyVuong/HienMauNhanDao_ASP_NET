import http from '../utils/http';
import { unwrapList, unwrapData } from '../utils/apiHelper';

const chungNhanService = {
  getCandidates: async () => unwrapList(await http.get('/chungnhan/candidates')),
  issue: async (maDon) => unwrapData(await http.post(`/chungnhan/issue/${maDon}`)),
  issueAll: async () => unwrapData(await http.post('/chungnhan/issue-all')),
};

export default chungNhanService;
