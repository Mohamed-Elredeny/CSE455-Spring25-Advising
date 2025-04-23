import {FC, useState} from 'react'
import {Plan} from '../../core/_models'
import {getAllPlans} from '../../core/_requests'
import {KTCard, KTCardBody} from '../../../../../_metronic/helpers'

const PlanComparison: FC = () => {
  const [searchQuery, setSearchQuery] = useState('') // Search input
  const [searchResults, setSearchResults] = useState<Plan[]>([]) // Search results
  const [selectedPlans, setSelectedPlans] = useState<Plan[]>([]) // Selected plans for comparison
  const [comparisonResult, setComparisonResult] = useState<Record<string, unknown> | null>(null) // Comparison result from backend
  const [loading, setLoading] = useState(false) // Loading state
  const [error, setError] = useState<string | null>(null) // Error state

  // Search for plans
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const response = await getAllPlans() // Fetch all plans
      const filteredPlans = response.data.filter(
        (plan) =>
          plan.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plan.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plan.student_id?.toString().includes(searchQuery)
      )
      setSearchResults(filteredPlans)
    } catch (err) {
      console.error('Error searching plans:', err)
      setError('Failed to fetch plans. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Add a plan to the comparison list
  const addPlanToCompare = (plan: Plan) => {
    if (selectedPlans.length >= 2) {
      alert('You can only compare two plans at a time.')
      return
    }
    if (!selectedPlans.find((p) => p.plan_id === plan.plan_id)) {
      setSelectedPlans((prev) => [...prev, plan])
    }
  }

  // Remove a plan from the comparison list
  const removePlanFromCompare = (planId: number) => {
    setSelectedPlans((prev) => prev.filter((p) => p.plan_id !== planId))
  }

  // Send selected plans to backend for comparison
  const handleCompare = async () => {
    if (selectedPlans.length !== 2) {
      alert('Please select exactly two plans to compare.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Mock API call to backend for comparison
      const response = await fetch('/api/compare-plans', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          plan1: selectedPlans[0].plan_id,
          plan2: selectedPlans[1].plan_id,
        }),
      })
      const result = await response.json()
      setComparisonResult(result)
    } catch (err) {
      console.error('Error comparing plans:', err)
      setError('Failed to compare plans. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Search Section */}
      <KTCard className='mb-8'>
        <KTCardBody>
          <div className='d-flex flex-column flex-md-row gap-5'>
            <div className='flex-grow-1'>
              <input
                type='text'
                className='form-control form-control-solid'
                placeholder='Search Plans by Program, University, or Student ID...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button className='btn btn-primary' onClick={handleSearch} disabled={loading}>
              {loading ? (
                <span className='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>
              ) : (
                'Search'
              )}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className='bg-light rounded p-4 mt-4'>
              <div className='fs-5 fw-bold mb-4'>Search Results</div>
              <div className='table-responsive'>
                <table className='table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3'>
                  <thead>
                    <tr className='fw-bold text-muted'>
                      <th>Plan ID</th>
                      <th>Program</th>
                      <th>University</th>
                      <th>Version</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((plan) => (
                      <tr key={plan.plan_id}>
                        <td>{plan.plan_id}</td>
                        <td>{plan.program}</td>
                        <td>{plan.university}</td>
                        <td>{plan.version}</td>
                        <td>
                          <button
                            className='btn btn-sm btn-light-primary'
                            onClick={() => addPlanToCompare(plan)}
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

      {/* Comparison Section */}
      {selectedPlans.length > 0 && (
        <KTCard className='mb-8'>
          <KTCardBody>
            <div className='fs-5 fw-bold mb-4'>Selected Plans for Comparison</div>
            <div className='d-flex flex-wrap gap-5'>
              {selectedPlans.map((plan) => (
                <div key={plan.plan_id} className='border p-4 rounded'>
                  <div className='fw-bold'>{plan.program}</div>
                  <div>Version: {plan.version}</div>
                  <div>Student ID: {plan.student_id}</div>
                  <button
                    className='btn btn-sm btn-light-danger mt-3'
                    onClick={() => removePlanFromCompare(plan.plan_id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button className='btn btn-primary mt-4' onClick={handleCompare} disabled={loading}>
              {loading ? (
                <span className='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>
              ) : (
                'Compare Plans'
              )}
            </button>
          </KTCardBody>
        </KTCard>
      )}

      {/* Comparison Results */}
      {comparisonResult && (
        <KTCard>
          <KTCardBody>
            <div className='fs-5 fw-bold mb-4'>Comparison Results</div>
            <pre>{JSON.stringify(comparisonResult, null, 2)}</pre>
          </KTCardBody>
        </KTCard>
      )}

      {/* Error Message */}
      {error && <div className='alert alert-danger mt-4'>{error}</div>}
    </>
  )
}

export {PlanComparison}