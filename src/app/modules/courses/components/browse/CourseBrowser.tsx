import {FC, useState, useEffect, useCallback} from 'react'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {Course, Category} from '../../core/_models'
import {
  getAllCourses,
  getAllCategories,
  getCoursesByLevel,
  getCoreCourses,
  getCoursesByCategory,
} from '../../core/_requests'
import {KTCard, KTCardBody} from '../../../../../_metronic/helpers'

interface ApiError {
  message: string;
}

const CourseBrowser: FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState({
    level: 'all',
    category: searchParams.get('category') || 'all',
    type: 'all',
  })

  const loadCourses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let response
      if (filter.category !== 'all') {
        response = await getCoursesByCategory(filter.category)
      } else if (filter.level !== 'all') {
        response = await getCoursesByLevel(parseInt(filter.level))
      } else if (filter.type === 'core') {
        response = await getCoreCourses()
      } else {
        response = await getAllCourses()
      }
      setCourses(response.data)
      setError(null)
    } catch (err: unknown) {
      const error = err as ApiError
      console.error('Error loading courses:', error)
      setError(error.message || 'Failed to load courses')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  const loadCategories = async () => {
    try {
      const response = await getAllCategories()
      setCategories(response.data)
    } catch (err: unknown) {
      const error = err as ApiError
      console.error('Error loading categories:', error)
      setCategories([])
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadCourses()
  }, [filter, loadCourses])

  const handleFilterChange = (key: string, value: string) => {
    setFilter((prev) => ({...prev, [key]: value}))
  }

  return (
    <>
      <KTCard className='mb-8'>
        <KTCardBody>
          <div className='d-flex flex-column flex-md-row gap-5 mb-8'>
            <div className='flex-grow-1'>
              <label className='form-label'>Level</label>
              <select
                className='form-select form-select-solid'
                value={filter.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
              >
                <option value='all'>All Levels</option>
                <option value='100'>100 Level</option>
                <option value='200'>200 Level</option>
                <option value='300'>300 Level</option>
                <option value='400'>400 Level</option>
              </select>
            </div>
            <div className='flex-grow-1'>
              <label className='form-label'>Category</label>
              <select
                className='form-select form-select-solid'
                value={filter.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value='all'>All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex-grow-1'>
              <label className='form-label'>Type</label>
              <select
                className='form-select form-select-solid'
                value={filter.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value='all'>All Courses</option>
                <option value='core'>Core Courses</option>
              </select>
            </div>
          </div>

          {error && (
            <div className='alert alert-danger mb-8'>
              <div className='d-flex flex-column'>
                <h4 className='mb-1 text-danger'>Error</h4>
                <span>{error}</span>
              </div>
            </div>
          )}
        </KTCardBody>
      </KTCard>

      <div className='row g-6 g-xl-9'>
        {loading ? (
          <div className='col-12'>
            <div className='d-flex justify-content-center w-100 py-10'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          </div>
        ) : courses.length === 0 && !error ? (
          <div className='col-12'>
            <div className='alert alert-info'>
              No courses found. Try adjusting your filters.
            </div>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.course_id} className='col-md-6 col-xl-4'>
              <KTCard className='h-100'>
                <KTCardBody className='p-9'>
                  <div className='fs-3 fw-bold text-dark mb-3'>{course.title}</div>
                  <div className='fs-5 text-gray-600 mb-5'>{course.description}</div>
                  <div className='d-flex flex-wrap mb-5'>
                    <div className='border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-2 mb-2'>
                      <div className='fs-6 text-gray-800 fw-bold'>{course.course_id}</div>
                      <div className='fw-semibold text-gray-400'>Course ID</div>
                    </div>
                    <div className='border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-2 mb-2'>
                      <div className='fs-6 text-gray-800 fw-bold'>{course.credits}</div>
                      <div className='fw-semibold text-gray-400'>Credits</div>
                    </div>
                    <div className='border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-2 mb-2'>
                      <div className='fs-6 text-gray-800 fw-bold'>{course.instructor}</div>
                      <div className='fw-semibold text-gray-400'>Instructor</div>
                    </div>
                  </div>
                  <div className='d-flex flex-wrap'>
                    <button
                      className='btn btn-sm btn-light-primary me-2 mb-2'
                      onClick={() => navigate(`../prerequisites/${course.course_id}`)}
                    >
                      View Prerequisites
                    </button>
                    <button
                      className='btn btn-sm btn-light-info mb-2'
                      onClick={() => navigate(`../compare?course=${course.course_id}`)}
                    >
                      Compare
                    </button>
                  </div>
                </KTCardBody>
              </KTCard>
            </div>
          ))
        )}
      </div>
    </>
  )
}

export {CourseBrowser} 