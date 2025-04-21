import {FC, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Course, CourseSearchParams} from '../../core/_models'
import {searchCourses} from '../../core/_requests'
import {KTCard, KTCardBody} from '../../../../../_metronic/helpers'

const CourseSearch: FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useState<CourseSearchParams>({
    query: '',
    searchBy: 'all',
  })
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!searchParams.query.trim()) return

    setLoading(true)
    try {
      const response = await searchCourses(searchParams.query, searchParams.searchBy)
      setCourses(response.data)
      setSearched(true)
    } catch (error) {
      console.error('Error searching courses:', error)
    } finally {
      setLoading(false)
    }
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
                onChange={(e) =>
                  setSearchParams((prev) => ({...prev, query: e.target.value}))
                }
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className='w-200px'>
              <select
                className='form-select form-select-solid'
                value={searchParams.searchBy}
                onChange={(e) =>
                  setSearchParams((prev) => ({...prev, searchBy: e.target.value as CourseSearchParams['searchBy']}))
                }
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
            <button className='btn btn-primary' onClick={handleSearch} disabled={loading}>
              {loading ? (
                <span className='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </KTCardBody>
      </KTCard>

      {searched && (
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
      )}
    </>
  )
}

export {CourseSearch} 