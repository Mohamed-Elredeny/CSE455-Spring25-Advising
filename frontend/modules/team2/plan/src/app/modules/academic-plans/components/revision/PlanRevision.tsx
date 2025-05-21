import {FC, useEffect, useState} from 'react'
import {Plan} from '../../core/_models'
import {getAllPlans} from '../../core/_requests'
import {KTCard, KTCardBody} from '../../../../../_metronic/helpers'
import {useNavigate} from 'react-router-dom'

const PlanRevision: FC = () => {
  const [pendingPlans, setPendingPlans] = useState<Plan[]>([]) // State for pending plans
  const [loading, setLoading] = useState(true) // Loading state
  const [error, setError] = useState<string | null>(null) // Error state
  const navigate = useNavigate() // For navigation

  // Fetch all pending plans
  const loadPendingPlans = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getAllPlans()
      const plans = response.data.filter((plan) => plan.status === 'PENDING') // Filter pending plans
      setPendingPlans(plans)
    } catch (err) {
      console.error('Error fetching plans:', err)
      setError('Failed to load pending plans. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPendingPlans()
  }, [])

  if (loading) {
    return (
      <div className='d-flex justify-content-center align-items-center min-h-300px'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='alert alert-danger'>
        <div className='d-flex flex-column'>
          <h4 className='mb-1 text-danger'>Error</h4>
          <span>{error}</span>
        </div>
      </div>
    )
  }

  if (pendingPlans.length === 0) {
    return (
      <div className='alert alert-info'>
        <div className='d-flex flex-column'>
          <h4 className='mb-1 text-info'>No Pending Plans</h4>
          <span>There are no plans awaiting approval or rejection.</span>
        </div>
      </div>
    )
  }

  return (
    <div className='row g-6 g-xl-9'>
      {pendingPlans.map((plan) => (
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
                  <div className='fs-6 text-gray-800 fw-bold'>{plan.program}</div>
                  <div className='fw-semibold text-gray-400'>Plan Program</div>
                </div>
              </div>
              <div className='d-flex justify-content-center'>
                <button
                  className='btn btn-sm btn-light-primary'
                  onClick={() => navigate(`/academics/academic-plans/revisionDetails/${plan.id}`)}
                >
                  View Details
                </button>
              </div>
            </KTCardBody>
          </KTCard>
        </div>
      ))}
    </div>
  )
}

export {PlanRevision}