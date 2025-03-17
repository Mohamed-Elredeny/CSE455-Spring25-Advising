import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import AcademicPlanForm from '../components/AcademicPlanForm.vue';
import PlanList from '../components/PlanList.vue';

const routes = [
  { path: '/', component: HomePage },
  { path: '/create', component: AcademicPlanForm },
  { path: '/plans', component: PlanList }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
