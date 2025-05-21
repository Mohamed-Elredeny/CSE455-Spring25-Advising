export interface Course {
  id?: number 
  course_id: string
  title: string
  description: string
  instructor: string
  credits: number
  department: string
  is_core: boolean
  level?: number
  prerequisites: string[]
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
  id?: number 
  university: string
  department?: string 
  program: string
  version?: number // Optional for new plans
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' // Optional for new plans
  semesters: Semester[]
  shared_link?: string
  updated_at?: string 
}

export interface Semester {
  name: string
  courses: Course[]
}
