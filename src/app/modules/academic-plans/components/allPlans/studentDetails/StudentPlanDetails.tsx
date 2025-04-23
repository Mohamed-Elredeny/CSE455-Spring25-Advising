import {FC, useEffect, useState, useCallback} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {Plan} from '../../../core/_models'
import {getAllPlans} from '../../../core/_requests'
import {KTCard, KTCardBody} from '../../../../../../_metronic/helpers'
import {Tabs, TabList, Tab, TabPanel} from 'react-tabs'
import 'react-tabs/style/react-tabs.css'

const StudentPlanDetails: FC = () => {
  const {planId} = useParams<{planId: string}>() // Get plan ID from URL
  const [plan, setPlan] = useState<Plan | null>(null) // State for the plan details
  const [loading, setLoading] = useState(true) // Loading state
  const [error, setError] = useState<string | null>(null) // Error state
  const navigate = useNavigate() // For navigation

  // Fetch plan details
  const loadPlanDetails = useCallback(async () => {
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
  }, [planId])
  // Handle plan update
  const handleUpdate = () => {
    navigate(`/academics/plans/update/${plan?.plan_id}`) // Navigate to the update page
  }

  // Handle plan deletion
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      alert(`Plan ${plan?.plan_id} has been deleted.`)
      navigate('/academics/plans') // Navigate back to the plans list
    }
  }

  useEffect(() => {
    loadPlanDetails()
  }, [loadPlanDetails])

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

        {/* Tabs */}
        <Tabs>
          <TabList>
            <Tab>Plan Information</Tab>
            <Tab>Degree Requirements</Tab>
            <Tab>Graduation Path</Tab>
            <Tab>Timeline</Tab>
          </TabList>

          {/* Plan Information Tab */}
          <TabPanel>
            <div>
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
                  <span className='fw-bold'>Student ID:</span> {plan.student_id || 'N/A'}
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
                <button className='btn btn-primary' onClick={handleUpdate}>
                  Update Plan
                </button>
                <button className='btn btn-danger' onClick={handleDelete}>
                  Delete Plan
                </button>
              </div>
            </div>
          </TabPanel>

          {/* Degree Requirements Tab */}
          <TabPanel>
            <h4 className='fw-bold text-dark mb-3'>Degree Requirements</h4>
            <p>Display degree requirements here...</p>
          </TabPanel>

          {/* Graduation Path Tab */}
          <TabPanel>
            <h4 className='fw-bold text-dark mb-3'>Graduation Path</h4>
            <p>Display graduation path here...</p>
          </TabPanel>

          {/* Timeline Tab */}
          <TabPanel>
            <h4 className='fw-bold text-dark mb-3'>Timeline</h4>
            <p>Display timeline here...</p>
          </TabPanel>
        </Tabs>
      </KTCardBody>
    </KTCard>
  )
}

export {StudentPlanDetails}