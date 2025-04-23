import {FC, useEffect, useState} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {Plan} from '../../../core/_models'
import {getAllPlans} from '../../../core/_requests'
import {KTCard, KTCardBody} from '../../../../../../_metronic/helpers'

const PlanDetails: FC = () => {
  const {planId} = useParams<{planId: string}>() // Get plan ID from URL
  const [plan, setPlan] = useState<Plan | null>(null) // State for the plan details
  const [loading, setLoading] = useState(true) // Loading state
  const [error, setError] = useState<string | null>(null) // Error state
  const navigate = useNavigate() // For navigation

  // Fetch plan details
  const loadPlanDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getAllPlans()
      const foundPlan = response.data.find((p) => p.plan_id.toString() === planId)
      if (!foundPlan) {
        setError('Plan not found.')
      } else {
        setPlan(foundPlan)
      }
    } catch (err) {
      console.error('Error fetching plan details:', err)
      setError('Failed to load plan details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Approve the plan
  const handleApprove = () => {
    alert(`Plan ${plan?.plan_id} has been approved.`)
    navigate('/academics/academic-plans/revision') // Navigate back to the revision page
  }

  // Reject the plan
  const handleReject = () => {
    alert(`Plan ${plan?.plan_id} has been rejected.`)
    navigate('/academics/academic-plans/revision') // Navigate back to the revision page
  }

  useEffect(() => {
    loadPlanDetails()
  }, [planId])

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

  if (!plan) {
    return null
  }

  return (
    <KTCard>
      <KTCardBody>
        <h3 className='fw-bold text-dark mb-5'>Plan Details</h3>

        {/* Plan Information */}
        <div className='mb-5'>
          <div>
            <span className='fw-bold'>Program:</span> {plan.program}
          </div>
          <div>
            <span className='fw-bold'>University:</span> {plan.university}
          </div>
          <div>
            <span className='fw-bold'>Version:</span> {plan.version}
          </div>
          <div>
            <span className='fw-bold'>Student ID:</span> {plan.student_id}
          </div>
          <div>
            <span className='fw-bold'>Status:</span> {plan.status}
          </div>
        </div>

        {/* Semesters */}
        <h4 className='fw-bold text-dark mb-3'>Semesters</h4>
        {plan.semesters.map((semester, index) => (
          <div key={index} className='mb-4'>
            <h5 className='fw-bold text-gray-800'>{semester.name}</h5>
            <ul>
              {semester.courses.map((course, i) => (
                <li key={i}>
                  {course.title} ({course.credits} credits)
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Action Buttons */}
        <div className='d-flex justify-content-between mt-5'>
          <button className='btn btn-success' onClick={handleApprove}>
            Approve
          </button>
          <button className='btn btn-danger' onClick={handleReject}>
            Reject
          </button>
        </div>
      </KTCardBody>
    </KTCard>
  )
}

export {PlanDetails}