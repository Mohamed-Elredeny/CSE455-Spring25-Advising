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

export interface CourseCreate {
  course_id: string
  title: string
  description: string
  instructor: string
  credits: number
  department: string
  is_core?: boolean
  level?: number
  prerequisites?: string[]
  sections?: SectionCreate[]
  categories?: string[]
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

export interface SectionCreate {
  section_id: string
  instructor: string
  capacity: number
  schedule_day: string
  schedule_time: string
}

export interface Category {
  id: string
  name: string
  description: string
  courses: string[]
}

export interface CategoryCreate {
  name: string
  description: string
}

export interface CourseSearchParams {
  query: string
  searchBy: 'all' | 'title' | 'description' | 'instructor' | 'department' | 'course_id' | 'category'
}

export interface PrerequisiteNode {
  courseId: string
  title: string
  level: number
  children: PrerequisiteNode[]
} 