import {FC, useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'
import {Course, PrerequisiteNode} from '../../core/_models'
import {getCourseById, getCourseDependencies} from '../../core/_requests'
import {KTCard, KTCardBody} from '../../../../../_metronic/helpers'

const PrerequisiteVisualizer: FC = () => {
  const {courseId} = useParams<{courseId: string}>()
  const [course, setCourse] = useState<Course | null>(null)
  const [dependencies, setDependencies] = useState<PrerequisiteNode | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (courseId) {
      loadCourseData()
    }
  }, [courseId])

  const loadCourseData = async () => {
    if (!courseId) return
    setLoading(true)
    try {
      const [courseResponse, dependenciesResponse] = await Promise.all([
        getCourseById(courseId),
        getCourseDependencies(courseId),
      ])
      setCourse(courseResponse.data)
      setDependencies(dependenciesResponse.data as PrerequisiteNode)
    } catch (error) {
      console.error('Error loading course data:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderPrerequisiteTree = (node: PrerequisiteNode, level: number = 0) => {
    return (
      <div key={node.courseId} style={{marginLeft: `${level * 20}px`}} className='mb-5'>
        <div className='d-flex align-items-center p-5 bg-light-primary rounded'>
          <div className='d-flex flex-column flex-grow-1'>
            <span className='text-gray-800 fw-bold fs-6'>{node.title}</span>
            <span className='text-gray-400'>{node.courseId}</span>
          </div>
          <span className='badge badge-primary'>{`Level ${node.level}`}</span>
        </div>
        {node.children.length > 0 && (
          <div className='ms-5 mt-5'>
            {node.children.map((child) => renderPrerequisiteTree(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className='d-flex justify-content-center align-items-center min-h-300px'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    )
  }

  if (!course || !dependencies) {
    return (
      <div className='alert alert-warning'>
        <div className='d-flex flex-column'>
          <h4 className='mb-1 text-warning'>Course Not Found</h4>
          <span>The requested course could not be found or has no prerequisites.</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <KTCard className='mb-8'>
        <KTCardBody>
          <div className='d-flex flex-column'>
            <div className='fs-2x fw-bold text-gray-800 mb-2'>{course.title}</div>
            <div className='text-gray-600 fw-semibold fs-4 mb-4'>{course.description}</div>
            <div className='d-flex flex-wrap'>
              <div className='border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-2 mb-2'>
                <div className='fs-6 text-gray-800 fw-bold'>{course.course_id}</div>
                <div className='fw-semibold text-gray-400'>Course ID</div>
              </div>
              <div className='border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-2 mb-2'>
                <div className='fs-6 text-gray-800 fw-bold'>{course.credits}</div>
                <div className='fw-semibold text-gray-400'>Credits</div>
              </div>
              <div className='border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 mb-2'>
                <div className='fs-6 text-gray-800 fw-bold'>{course.department}</div>
                <div className='fw-semibold text-gray-400'>Department</div>
              </div>
            </div>
          </div>
        </KTCardBody>
      </KTCard>

      <KTCard>
        <KTCardBody>
          <h3 className='card-title align-items-start flex-column mb-8'>
            <span className='card-label fw-bold fs-3 mb-1'>Prerequisites Tree</span>
            <span className='text-gray-400 fw-semibold fs-6'>
              Visualizing course dependencies and requirements
            </span>
          </h3>
          <div className='separator separator-dashed mb-8'></div>
          {renderPrerequisiteTree(dependencies)}
        </KTCardBody>
      </KTCard>
    </>
  )
}

export {PrerequisiteVisualizer} 