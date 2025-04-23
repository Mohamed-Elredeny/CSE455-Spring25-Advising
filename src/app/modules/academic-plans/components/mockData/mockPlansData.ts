import {Plan} from '../../core/_models'

export const mockPlans: Plan[] = [
  {
    plan_id: 1,
    student_id: 1,
    university: 'Alalmain International University',
    program: 'Computer Science',
    Level: 2,
    version: 1,
    status: 'PENDING',
    semesters: [
      {
        name: 'Fall 2025',
        courses: [
          {
            code: 'CS101',
            title: 'Introduction to Computer Science',
            type: 'core',
            credits: 3,
            description: 'Basic concepts of computer science',
            prerequisites: ['CS010', 'CS020'],
          },
          {
            code: 'CS102',
            title: 'Data Structures',
            type: 'core',
            credits: 4,
            description: 'Introduction to data structures and algorithms',
            prerequisites: ['CS101'],
          },
        ],
      },
      {
        name: 'Spring 2026',
        courses: [
          {
            code: 'CS201',
            title: 'Algorithms',
            type: 'core',
            credits: 4,
            description: 'Advanced algorithms and problem-solving techniques',
            prerequisites: ['CS102'],
          },
          {
            code: 'CS202',
            title: 'Operating Systems',
            type: 'core',
            credits: 3,
            description: 'Concepts of operating systems and resource management',
            prerequisites: ['CS102'],
          },
        ],
      },
      {
        name: 'Fall 2026',
        courses: [
          {
            code: 'CS301',
            title: 'Database Systems',
            type: 'core',
            credits: 3,
            description: 'Introduction to database design and SQL',
            prerequisites: ['CS201'],
          },
          {
            code: 'CS302',
            title: 'Computer Networks',
            type: 'core',
            credits: 3,
            description: 'Fundamentals of computer networking and protocols',
            prerequisites: ['CS202'],
          },
        ],
      },
    ],
  },
  {
    plan_id: 2,
    student_id: 2,
    university: 'Alalmain International University',
    program: 'Engineering',
    Level: 3,
    version: 2,
    status: 'APPROVED',
    semesters: [
      {
        name: 'Spring 2025',
        courses: [
          {
            code: 'ENG201',
            title: 'Engineering Mechanics',
            type: 'core',
            credits: 4,
            description: 'Fundamentals of mechanics in engineering',
            prerequisites: ['ENG101'],
          },
          {
            code: 'ENG202',
            title: 'Thermodynamics',
            type: 'core',
            credits: 3,
            description: 'Introduction to thermodynamics and energy systems',
            prerequisites: ['ENG101'],
          },
        ],
      },
      {
        name: 'Fall 2025',
        courses: [
          {
            code: 'ENG301',
            title: 'Fluid Mechanics',
            type: 'core',
            credits: 4,
            description: 'Principles of fluid mechanics and applications',
            prerequisites: ['ENG201'],
          },
          {
            code: 'ENG302',
            title: 'Structural Analysis',
            type: 'core',
            credits: 3,
            description: 'Analysis of structures and materials',
            prerequisites: ['ENG201'],
          },
        ],
      },
    ],
  },
]