import axios from 'axios'
import {Course, CourseCreate, Category, Section} from './_models'

const API_URL = import.meta.env.VITE_APP_API_URL

export const COURSES_URL = `${API_URL}/courses`
export const CATEGORIES_URL = `${API_URL}/categories`

// Course API calls
export const getAllCourses = (skip = 0, limit = 100) => {
  return axios.get<Course[]>(`${COURSES_URL}/?skip=${skip}&limit=${limit}`)
}

export const getCourseById = (courseId: string) => {
  return axios.get<Course>(`${COURSES_URL}/${courseId}`)
}

export const searchCourses = (query: string, searchBy = 'all') => {
  return axios.get<Course[]>(`${COURSES_URL}/search/?query=${query}&search_by=${searchBy}`)
}

export const getCoursesByCategory = (categoryName: string, skip = 0, limit = 100) => {
  return axios.get<Course[]>(`${COURSES_URL}/by-category/${categoryName}?skip=${skip}&limit=${limit}`)
}

export const getCoreCourses = (skip = 0, limit = 100) => {
  return axios.get<Course[]>(`${COURSES_URL}/core/?skip=${skip}&limit=${limit}`)
}

export const getCoursesByLevel = (level: number, skip = 0, limit = 100) => {
  return axios.get<Course[]>(`${COURSES_URL}/by-level/${level}?skip=${skip}&limit=${limit}`)
}

// Category API calls
export const getAllCategories = (skip = 0, limit = 100) => {
  return axios.get<Category[]>(`${CATEGORIES_URL}/?skip=${skip}&limit=${limit}`)
}

export const getCategoryById = (categoryId: string) => {
  return axios.get<Category>(`${CATEGORIES_URL}/${categoryId}`)
}

// Section API calls
export const getCourseSections = (courseId: string, skip = 0, limit = 100) => {
  return axios.get<Section[]>(`${COURSES_URL}/${courseId}/sections/?skip=${skip}&limit=${limit}`)
}

// Prerequisite API calls
export const getCourseDependencies = (courseId: string) => {
  return axios.get(`${COURSES_URL}/${courseId}/dependencies`)
}

export const checkPrerequisites = (courseId: string, completedCourses: string[]) => {
  return axios.post(`${COURSES_URL}/${courseId}/check-prerequisites`, completedCourses)
} 