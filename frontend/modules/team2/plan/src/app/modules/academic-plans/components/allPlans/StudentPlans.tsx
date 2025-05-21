import {FC, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Plan} from '../../core/_models'
import {getAllPlans} from '../../core/_requests'
import {KTCard, KTCardBody} from '../../../../../_metronic/helpers'
import {useEffect} from 'react'

const StudentPlans: FC = () => {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<Plan[]>([]) // State for fetched plans
  const [loading, setLoading] = useState(false) // Loading state
  const [error, setError] = useState<string | null>(null) // Error state
  const [filterState, setFilterState] = useState('all') // State for filtering by plan state

  const handleSearch = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getAllPlans()
      let filteredPlans = response.data

      if (filterState !== 'all') {
        filteredPlans = filteredPlans.filter(
          (plan) => plan.status === filterState
        )
      }

      setPlans(filteredPlans)

      if (filteredPlans.length === 0) {
        setError('No plans found for the given criteria.')
      }
    } catch (err) {
      console.error('Error fetching plans:', err)
      setError('Failed to fetch plans. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <KTCard className='mb-8'>
        <KTCardBody>
          <div className='d-flex flex-column flex-md-row gap-5'>
            {/* Dropdown for State Filter */}
            <div>
              <select
                className='form-select form-select-solid'
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
              >
                <option value='all'>All States</option>
                <option value='PENDING'>Pending</option>
                <option value='APPROVED'>Approved</option>
                <option value='REJECTED'>Rejected</option>
              </select>
            </div>
            {/* Search Button */}
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

      {/* Error Message */}
      {error && <div className='alert alert-danger'>{error}</div>}

      {/* Display Plans */}
      <div className='row g-6 g-xl-9'>
        {loading ? (
          <div className='col-12'>
            <div className='d-flex justify-content-center w-100 py-10'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          </div>
        ) : plans.length === 0 ? (
          <div className='col-12'>
            <div className='alert alert-info'>No plans found for the given criteria.</div>
          </div>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className='col-md-6 col-xl-4'>
              <KTCard className='h-100'>
                <KTCardBody className='p-9'>
                  <div className='fs-3 fw-bold text-dark mb-3'>{plan.program}</div>
                  <div className='fs-5 text-gray-600 mb-5'>{plan.university}</div>
                  <div className='d-flex flex-wrap mb-5'>
                    <div className='border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-2 mb-2'>
                      <div className='fs-6 text-gray-800 fw-bold'>{plan.version}</div>
                      <div className='fw-semibold text-gray-400'>Version</div>
                    </div>
                    <div className='border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-2 mb-2'>
                      <div className={`fs-6 fw-bold ${plan.status === 'REJECTED' ? 'text-danger' : 'text-gray-800'}`}>
                        {plan.status}
                      </div>
                      <div className='fw-semibold text-gray-400'>Status</div>
                    </div>
                  </div>
                  <button
                    className='btn btn-sm btn-light-primary'
                    onClick={() => navigate(`/academics/academic-plans/studentDetails/${plan.id}`)}
                  >
                    View Details
                  </button>
                </KTCardBody>
              </KTCard>
            </div>
          ))
        )}
      </div>
    </>
  )
}

export {StudentPlans}