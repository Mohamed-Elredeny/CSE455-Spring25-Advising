import {FC, useState, useCallback, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {Course, CourseSearchParams} from '../../core/_models'
import {searchCourses} from '../../core/_requests'
import {KTCard, KTCardBody} from '../../../../../_metronic/helpers'
import debounce from 'lodash/debounce'

interface ApiError {
  message: string;
}

const CourseSearch: FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useState<CourseSearchParams>({
    query: '',
    searchBy: 'all',
  })
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const performSearch = async (query: string, searchBy: string) => {
    if (!query.trim()) {
      setCourses([])
      setSearched(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await searchCourses(query, searchBy)
      setCourses(response.data)
      setSearched(true)
    } catch (err: unknown) {
      const error = err as ApiError
      console.error('Error searching courses:', error)
      setError(error.message || 'Failed to search courses')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((query: string, searchBy: string) => performSearch(query, searchBy), 300),
    []
  )

  useEffect(() => {
    if (searchParams.query) {
      debouncedSearch(searchParams.query, searchParams.searchBy)
    }
  }, [searchParams, debouncedSearch])

  const handleSearchChange = (key: string, value: string) => {
    setSearchParams((prev) => ({...prev, [key]: value}))
  }

  return (
    <>
      <KTCard className='mb-8'>
        <KTCardBody>
          <div className='d-flex flex-column flex-md-row gap-5'>
            <div className='flex-grow-1'>
              <input
                type='text'
                className='form-control form-control-solid'
                placeholder='Search courses...'
                value={searchParams.query}
                onChange={(e) => handleSearchChange('query', e.target.value)}
              />
            </div>
            <div>
              <select
                className='form-select form-select-solid'
                value={searchParams.searchBy}
                onChange={(e) => handleSearchChange('searchBy', e.target.value)}
              >
                <option value='all'>All Fields</option>
                <option value='title'>Title</option>
                <option value='description'>Description</option>
                <option value='instructor'>Instructor</option>
                <option value='department'>Department</option>
                <option value='course_id'>Course ID</option>
                <option value='category'>Category</option>
              </select>
            </div>
          </div>

          {error && (
            <div className='alert alert-danger mt-8'>
              <div className='d-flex flex-column'>
                <h4 className='mb-1 text-danger'>Error</h4>
                <span>{error}</span>
              </div>
            </div>
          )}
        </KTCardBody>
      </KTCard>

      {loading ? (
        <div className='d-flex justify-content-center w-100 py-10'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      ) : (
        searched && (
          <div className='row g-6 g-xl-9'>
            {courses.length === 0 ? (
              <div className='col-12'>
                <div className='alert alert-info'>No courses found matching your search criteria.</div>
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
                          <div className='fs-6 text-gray-800 fw-bold'>{course.instructor}</div>
                          <div className='fw-semibold text-gray-400'>Instructor</div>
                        </div>
                        <div className='border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-2 mb-2'>
                          <div className='fs-6 text-gray-800 fw-bold'>{course.department}</div>
                          <div className='fw-semibold text-gray-400'>Department</div>
                        </div>
                      </div>
                      <div className='d-flex flex-wrap'>
                        <button
                          className='btn btn-sm btn-light-primary me-2 mb-2'
                          onClick={() => navigate(`/courses/prerequisites/${course.course_id}`)}
                        >
                          View Prerequisites
                        </button>
                        <button
                          className='btn btn-sm btn-light-info mb-2'
                          onClick={() => navigate(`/courses/compare?course=${course.course_id}`)}
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
        )
      )}
    </>
  )
}

export {CourseSearch} 