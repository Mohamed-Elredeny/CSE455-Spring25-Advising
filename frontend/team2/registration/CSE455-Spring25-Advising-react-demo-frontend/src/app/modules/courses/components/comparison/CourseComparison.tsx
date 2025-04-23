import {FC, useState, useEffect, useCallback} from 'react'
import {useSearchParams} from 'react-router-dom'
import {Course} from '../../core/_models'
import {getCourseById, searchCourses} from '../../core/_requests'
import {KTCard, KTCardBody} from '../../../../../_metronic/helpers'

interface ApiError {
  message: string;
}

const CourseComparison: FC = () => {
  const [searchParams] = useSearchParams()
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)

  const loadCourse = useCallback(async (courseId: string) => {
    try {
      const response = await getCourseById(courseId)
      if (!selectedCourses.find((c) => c.course_id === courseId)) {
        setSelectedCourses((prev) => [...prev, response.data])
      }
    } catch (err: unknown) {
      const error = err as ApiError
      console.error('Error loading course:', error)
    }
  }, [selectedCourses])

  useEffect(() => {
    const courseId = searchParams.get('course')
    if (courseId) {
      loadCourse(courseId)
    }
  }, [searchParams, loadCourse])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const response = await searchCourses(searchQuery)
      setSearchResults(response.data)
    } catch (err: unknown) {
      const error = err as ApiError
      console.error('Error searching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const addCourse = (course: Course) => {
    if (!selectedCourses.find((c) => c.course_id === course.course_id)) {
      setSelectedCourses((prev) => [...prev, course])
    }
    setSearchResults([])
    setSearchQuery('')
  }

  const removeCourse = (courseId: string) => {
    setSelectedCourses((prev) => prev.filter((c) => c.course_id !== courseId))
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
                placeholder='Search courses to compare...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button className='btn btn-primary' onClick={handleSearch} disabled={loading}>
              {loading ? (
                <span className='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>
              ) : (
                'Add Course'
              )}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className='bg-light rounded p-4 mt-4'>
              <div className='fs-5 fw-bold mb-4'>Search Results</div>
              <div className='table-responsive'>
                <table className='table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3'>
                  <thead>
                    <tr className='fw-bold text-muted'>
                      <th>Course ID</th>
                      <th>Title</th>
                      <th>Department</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((course) => (
                      <tr key={course.course_id}>
                        <td>{course.course_id}</td>
                        <td>{course.title}</td>
                        <td>{course.department}</td>
                        <td>
                          <button
                            className='btn btn-sm btn-light-primary'
                            onClick={() => addCourse(course)}
                          >
                            Add to Compare
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </KTCardBody>
      </KTCard>

      {selectedCourses.length > 0 && (
        <div className='row g-5 g-xl-8'>
          {selectedCourses.map((course) => (
            <div key={course.course_id} className='col-xl-6'>
              <KTCard>
                <KTCardBody>
                  <div className='d-flex justify-content-between align-items-center mb-5'>
                    <div className='d-flex flex-column'>
                      <span className='text-gray-800 fs-2 fw-bold'>{course.title}</span>
                      <span className='text-gray-400 fw-semibold'>{course.course_id}</span>
                    </div>
                    <button
                      className='btn btn-icon btn-sm btn-light-danger'
                      onClick={() => removeCourse(course.course_id)}
                    >
                      <i className='bi bi-x-lg'></i>
                    </button>
                  </div>

                  <div className='separator separator-dashed my-5'></div>

                  <div className='d-flex flex-column gap-5'>
                    <div>
                      <span className='fw-bold text-gray-600 me-2'>Department:</span>
                      <span className='text-gray-800'>{course.department}</span>
                    </div>
                    <div>
                      <span className='fw-bold text-gray-600 me-2'>Credits:</span>
                      <span className='text-gray-800'>{course.credits}</span>
                    </div>
                    <div>
                      <span className='fw-bold text-gray-600 me-2'>Instructor:</span>
                      <span className='text-gray-800'>{course.instructor}</span>
                    </div>
                    <div>
                      <span className='fw-bold text-gray-600 me-2'>Level:</span>
                      <span className='text-gray-800'>{course.level || 'N/A'}</span>
                    </div>
                    <div>
                      <span className='fw-bold text-gray-600 me-2'>Prerequisites:</span>
                      <span className='text-gray-800'>
                        {course.prerequisites.length > 0
                          ? course.prerequisites.join(', ')
                          : 'None'}
                      </span>
                    </div>
                    <div>
                      <span className='fw-bold text-gray-600 me-2'>Categories:</span>
                      <span className='text-gray-800'>
                        {course.categories.length > 0 ? course.categories.join(', ') : 'None'}
                      </span>
                    </div>
                    <div>
                      <span className='fw-bold text-gray-600 me-2'>Description:</span>
                      <p className='text-gray-800 mt-2'>{course.description}</p>
                    </div>
                  </div>
                </KTCardBody>
              </KTCard>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export {CourseComparison} 