import {FC, useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {Course, Category} from '../../core/_models'
import {getAllCourses, getAllCategories, getCoursesByLevel, getCoreCourses} from '../../core/_requests'
import {KTCard, KTCardBody} from '../../../../../_metronic/helpers'

const CourseBrowser: FC = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState({
    level: 'all',
    category: 'all',
    type: 'all',
  })

  useEffect(() => {
    loadCategories()
    loadCourses()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await getAllCategories()
      setCategories(response.data)
      setError(null)
    } catch (err: any) {
      console.error('Error loading categories:', err)
      setError(err.message || 'Failed to load categories')
      setCategories([])
    }
  }

  const loadCourses = async () => {
    setLoading(true)
    setError(null)
    try {
      let response
      if (filter.level !== 'all') {
        response = await getCoursesByLevel(parseInt(filter.level))
      } else if (filter.type === 'core') {
        response = await getCoreCourses()
      } else {
        response = await getAllCourses()
      }
      setCourses(response.data)
      setError(null)
    } catch (err: any) {
      console.error('Error loading courses:', err)
      setError(err.message || 'Failed to load courses')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [filter])

  const handleFilterChange = (key: string, value: string) => {
    setFilter((prev) => ({...prev, [key]: value}))
  }

  return (
    <>
      <div className='d-flex flex-wrap flex-stack pb-7'>
        <div className='d-flex flex-wrap align-items-center my-1'>
          <select
            className='form-select form-select-sm form-select-solid w-125px me-2'
            value={filter.level}
            onChange={(e) => handleFilterChange('level', e.target.value)}
          >
            <option value='all'>All Levels</option>
            <option value='1'>100 Level</option>
            <option value='2'>200 Level</option>
            <option value='3'>300 Level</option>
            <option value='4'>400 Level</option>
          </select>

          <select
            className='form-select form-select-sm form-select-solid w-125px me-2'
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

          <select
            className='form-select form-select-sm form-select-solid w-125px'
            value={filter.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value='all'>All Courses</option>
            <option value='core'>Core Courses</option>
          </select>
        </div>
      </div>

      {error && (
        <div className='alert alert-danger mb-5'>
          <div className='d-flex flex-column'>
            <h4 className='mb-1 text-danger'>Error</h4>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className='row g-6 g-xl-9'>
        {loading ? (
          <div className='d-flex justify-content-center w-100 py-10'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
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
                  </div>
                  <div className='d-flex flex-wrap'>
                    <button
                      className='btn btn-sm btn-light-primary me-2 mb-2'
                      onClick={() => navigate(`/academics/courses/prerequisites/${course.course_id}`)}
                    >
                      View Prerequisites
                    </button>
                    <button
                      className='btn btn-sm btn-light-info mb-2'
                      onClick={() => navigate(`/academics/courses/compare?course=${course.course_id}`)}
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