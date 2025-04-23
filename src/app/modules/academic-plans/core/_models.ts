export interface Course {
  course_id: string
  title: string
  description: string
  instructor: string
  credits: number
  department: string
  is_core: boolean
  level?: number
  prerequisites: string[]
  sections: Section[]
  categories: string[]
}

export interface Section {
  section_id: string
  course_id: string
  instructor: string
  schedule: string
  room: string
  capacity: number
  enrolled: number
  waitlist: number
}


export interface PlanSearchParams {
  query: string
  searchBy: 'all' | 'PENDING' | 'ACCEPTED' | 'REJECTED' 
}

export interface PrerequisiteNode {
  courseId: string
  title: string
  level: number
  children: PrerequisiteNode[]
}


export interface Plan {
  plan_id: number // Added to match the JSON structure
  student_id?: number // Added to match the JSON structure
  university: string
  program: string
  version: number // Changed from string to number to match the JSON structure
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  semesters: Semester[]
  shared_link?: string // Made optional since it wasn't in the JSON example
}

export interface Semester {
  name: string
  courses: Course[] // Updated to include detailed course information
}
