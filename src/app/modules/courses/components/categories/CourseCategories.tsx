import {FC, useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {Category} from '../../core/_models'
import {getAllCategories, getCoursesByCategory} from '../../core/_requests'
import {KTCard, KTCardBody} from '../../../../../_metronic/helpers'

const CourseCategories: FC = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const response = await getAllCategories()
      setCategories(response.data)
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='row g-6 g-xl-9'>
      {loading ? (
        <div className='col-12'>
          <div className='d-flex justify-content-center w-100 py-10'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        </div>
      ) : categories.length === 0 ? (
        <div className='col-12'>
          <div className='alert alert-info'>No course categories found.</div>
        </div>
      ) : (
        categories.map((category) => (
          <div key={category.id} className='col-md-6 col-xl-4'>
            <KTCard className='h-100'>
              <KTCardBody className='p-9'>
                <div className='fs-3 fw-bold text-dark mb-3'>{category.name}</div>
                <div className='fs-5 text-gray-600 mb-5'>{category.description}</div>
                <div className='d-flex flex-wrap'>
                  <button
                    className='btn btn-sm btn-light-primary'
                    onClick={() => navigate(`/courses/browse?category=${category.name}`)}
                  >
                    View Courses
                  </button>
                </div>
              </KTCardBody>
            </KTCard>
          </div>
        ))
      )}
    </div>
  )
}

export {CourseCategories} 