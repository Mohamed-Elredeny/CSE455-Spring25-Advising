import axios from 'axios'
import {Plan} from './_models'

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:8000'
export const PLANS_URL = `${API_URL}/academic-plans`
export const REQUIREMENTS_URL = `${API_URL}/requirements`
const SEMESTERS_URL = `${API_URL}/semesters`

// Get all academic plans (with optional pagination)
export const getAllPlans = async (skip = 0, limit = 100): Promise<{data: Plan[]}> => {
  const response = await axios.get<Plan[]>(`${PLANS_URL}/`, {
    params: { skip, limit }
  })
  return {data: response.data}
}

// Get a specific academic plan by ID
export const getPlanById = async (planId: number): Promise<{data: Plan}> => {
  const response = await axios.get<Plan>(`${PLANS_URL}/${planId}`)
  return {data: response.data}
}

// Create a new academic plan
export const createPlan = async (plan: Omit<Plan, 'plan_id' | 'version' | 'status'>): Promise<{data: Plan}> => {
  const response = await axios.post<Plan>(`${PLANS_URL}/`, plan)
  return {data: response.data}
}

// Update an academic plan (creates a new version)
export const updatePlan = async (planId: number, plan: Partial<Plan>): Promise<{data: Plan}> => {
  const response = await axios.put<Plan>(`${PLANS_URL}/${planId}`, plan)
  return {data: response.data}
}

// Delete an academic plan
export const deletePlan = async (planId: number): Promise<{data: {detail: string}}> => {
  const response = await axios.delete<{detail: string}>(`${PLANS_URL}/${planId}`)
  return {data: response.data}
}

// Approve an academic plan
export const approvePlan = async (planId: number): Promise<{data: Plan}> => {
  const response = await axios.put<Plan>(`${PLANS_URL}/${planId}/approve`)
  return {data: response.data}
}

// Reject an academic plan
export const rejectPlan = async (planId: number): Promise<{data: Plan}> => {
  const response = await axios.put<Plan>(`${PLANS_URL}/${planId}/reject`)
  return {data: response.data}
}

// Check requirements fulfillment
export const checkRequirements = async (planId: number): Promise<{data: any}> => {
  const response = await axios.get(`${PLANS_URL}/${planId}/requirements`)
  return {data: response.data}
}

// Compare academic plans
export const comparePlans = async (planIds: number[]): Promise<{data: any}> => {
  const response = await axios.post(`${PLANS_URL}/academic-plans/compare`, planIds)
  return {data: response.data}
}

// Get all versions of a plan by program
export const getPlanVersions = async (program: string): Promise<{data: Plan[]}> => {
  const response = await axios.get<Plan[]>(`${PLANS_URL}/${program}/versions`)
  return {data: response.data}
}
// Get plan requirements
export const getPlanRequirements = async (planId: number): Promise<{data: any}> => {
  const response = await axios.get(`${PLANS_URL}/${planId}/requirements`)
  return {data: response.data}
}

export const uploadAcademicPlan = async (program: string, file: File): Promise<{data: any}> => {
  const formData = new FormData()
  formData.append('program', program)
  formData.append('file', file)
  const response = await axios.post(`${PLANS_URL}/upload`, formData, {
    headers: {'Content-Type': 'multipart/form-data'}
  })
  return {data: response.data}
}
// restore a specific version of a plan
export const restorePlanVersion = async (program: string, version: number): Promise<{data: Plan}> => {
  const response = await axios.post<Plan>(`${PLANS_URL}/${program}/restore/${version}`)
  return {data: response.data}
}

// Create a new requirement
export const createRequirement = async (requirement: any): Promise<{data: any}> => {
  const response = await axios.post(`${REQUIREMENTS_URL}/`, requirement)
  return {data: response.data}
}

// Get all requirements (with optional pagination)
export const getAllRequirements = async (skip = 0, limit = 10): Promise<{data: any[]}> => {
  const response = await axios.get<any[]>(`${REQUIREMENTS_URL}/`, {
    params: { skip, limit }
  })
  return {data: response.data}
}

// Update a requirement
export const updateRequirement = async (requirementId: number, reqUpdate: any): Promise<{data: any}> => {
  const response = await axios.put(`${REQUIREMENTS_URL}/${requirementId}`, reqUpdate)
  return {data: response.data}
}

// Delete a requirement
export const deleteRequirement = async (requirementId: number): Promise<{data: any}> => {
  const response = await axios.delete(`${REQUIREMENTS_URL}/${requirementId}`)
  return {data: response.data}
}

// Generate a new shareable link for a plan
export const generateSharedLink = async (
  academic_plan_id: number,
  access_level: string, // e.g., "read", "edit"
  expiration_days?: number
): Promise<{data: {shareable_link: string}}> => {
  const response = await axios.post<{shareable_link: string}>(
    `${PLANS_URL}/${academic_plan_id}/share`,
    {
      access_level,
      ...(expiration_days !== undefined ? { expiration_days } : {})
    }
  )
  return {data: response.data}
}

// Get a plan by shared link
export const getPlanBySharedLink = async (shareable_link: string): Promise<{data: Plan}> => {
  const response = await axios.get<Plan>(`${PLANS_URL}/shared/${shareable_link}`)
  return {data: response.data}
}

// Create a new semester
export const createSemester = async (semester: any): Promise<{data: any}> => {
  const response = await axios.post(`${SEMESTERS_URL}/`, semester)
  return {data: response.data}
}

// Get a specific semester by ID
export const getSemesterById = async (semesterId: number): Promise<{data: any}> => {
  const response = await axios.get(`${SEMESTERS_URL}/${semesterId}`)
  return {data: response.data}
}

// Get all semesters (with optional pagination)
export const getAllSemesters = async (skip = 0, limit = 10): Promise<{data: any[]}> => {
  const response = await axios.get<any[]>(`${SEMESTERS_URL}/`, {
    params: { skip, limit }
  })
  return {data: response.data}
}

// Delete a semester
export const deleteSemester = async (semesterId: number): Promise<{data: any}> => {
  const response = await axios.delete(`${SEMESTERS_URL}/${semesterId}`)
  return {data: response.data}
}