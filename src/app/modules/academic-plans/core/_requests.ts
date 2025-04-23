import axios from 'axios'
import {mockPlans} from '../components/mockData/mockPlansData'
import {Plan} from './_models'

const API_URL = import.meta.env.VITE_APP_API_URL
const API_TOKEN = import.meta.env.VITE_APP_API_TOKEN

export const SEMESTERS_URL = `${API_URL}/semesters`
export const PLANS_URL = `${API_URL}/plans`  

// Simulate fetching plans by student ID
export const getPlansByStudentId = (studentId: string): Promise<{data: Plan[]}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredPlans = mockPlans.filter((plan) => (plan.student_id?.toString() ?? '') === studentId)
      resolve({data: filteredPlans})
    }, 500) // Simulate a delay
  })
}

// Simulate fetching all plans
export const getAllPlans = (): Promise<{data: Plan[]}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({data: mockPlans})
    }, 500) // Simulate a delay
  })
}

