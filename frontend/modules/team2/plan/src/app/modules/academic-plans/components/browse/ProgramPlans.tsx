import {FC, useState, useEffect, useCallback} from 'react'
import {useNavigate} from 'react-router-dom'
import {Plan} from '../../core/_models'
import {getAllPlans} from '../../core/_requests'
import {KTCard, KTCardBody} from '../../../../../_metronic/helpers'

interface ApiError {
  message: string
}

const AcademicPlansBrowser: FC = () => {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState({
    level: 'all',
    program: 'all',
  })

  const loadPlans = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getAllPlans()
      const data = response.data

      // Filter plans based on program
      const filteredPlans = data.filter((plan: Plan) => {
        const matchesProgram = filter.program === 'all' || plan.program === filter.program
        return matchesProgram
      })

      setPlans(filteredPlans)
    } catch (err: unknown) {
      const error = err as ApiError
      console.error('Error loading plans:', error)
      setError(error.message || 'Failed to load plans')
      setPlans([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    loadPlans()
  }, [filter, loadPlans])

  const handleFilterChange = (key: string, value: string) => {
    setFilter((prev) => ({...prev, [key]: value}))
  }

  return (
    <>
      <div className='d-flex flex-wrap flex-stack pb-7'>
        <div className='d-flex flex-wrap align-items-center my-1'>
          {/* Filter by Program */}
          <select
            className='form-select form-select-sm form-select-solid w-125px'
            value={filter.program}
            onChange={(e) => handleFilterChange('program', e.target.value)}
          >
            <option value='all'>All Programs</option>
            <option value='Computer Science'>Computer Science</option>
            <option value='Engineering'>Engineering</option>
            <option value='Business'>Business</option>
          </select>
        </div>

        {/* Add New Plan Button */}
        <button
          className='btn btn-primary'
          onClick={() => navigate('/academics/academic-plans/new')}
        >
          Add New Plan
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className='alert alert-danger mb-5'>
          <div className='d-flex flex-column'>
            <h4 className='mb-1 text-danger'>Error</h4>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Plans Display */}
      <div className='row g-6 g-xl-9'>
        {loading ? (
          <div className='d-flex justify-content-center w-100 py-10'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        ) : plans.length === 0 && !error ? (
          <div className='col-12'>
            <div className='alert alert-info'>
              No plans found. Try adjusting your filters.
            </div>
          </div>
        ) : (
          plans.map((plan, idx) => (
            <div key={plan.id ?? idx} className='col-md-6 col-xl-4'>
              <KTCard className='h-100'>
                <KTCardBody className='p-9'>
                  <div className='fs-3 fw-bold text-dark mb-3'>{plan.program}</div>
                  <div className='fs-5 text-gray-600 mb-5'>{plan.university}</div>
                  <div className='d-flex flex-wrap mb-5'>
                    <div className='border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-2 mb-2'>
                      <div className='fs-6 text-gray-800 fw-bold'>Version {plan.version}</div>
                      <div className='fw-semibold text-gray-400'>Version</div>
                    </div>
                  </div>
                  <div className='d-flex flex-wrap'>
                    <button
                      className='btn btn-sm btn-light-primary me-2 mb-2'
                      onClick={() => navigate(`/academics/academic-plans/browseDetails/${plan.id}`)}
                    > 
                      View Details
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

export {AcademicPlansBrowser}