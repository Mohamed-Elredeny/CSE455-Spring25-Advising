import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api', // Update this to your API base URL
    withCredentials: false,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    }
});

export default {
    getAcademicPlans() {
        return apiClient.get('/academicPlan');
    },
    getAcademicPlan(id) {
        return apiClient.get(`/academicPlan?id=${id}`);
    },
    createAcademicPlan(data) {
        return apiClient.post('/academicPlan', data);
    },
    updateAcademicPlan(data) {
        return apiClient.put('/academicPlan', data);
    },
    deleteAcademicPlan(id) {
        return apiClient.delete(`/academicPlan?id=${id}`);
    },
    addSemester(data) {
        return apiClient.post('/semester', data);
    },
    updateSemester(data) {
        return apiClient.put('/semester', data);
    },
    deleteSemester(id) {
        return apiClient.delete(`/semester?id=${id}`);
    }
};