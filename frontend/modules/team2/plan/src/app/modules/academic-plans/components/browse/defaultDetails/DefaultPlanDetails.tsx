import {FC, useEffect, useState, useCallback} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {Plan} from '../../../core/_models'
import {
  getPlanById, 
  generateSharedLink, 
  getPlanVersions, 
  getPlanBySharedLink, 
  getAllRequirements, 
  restorePlanVersion,
} from '../../../core/_requests'
import {KTCard, KTCardBody} from '../../../../../../_metronic/helpers'


const TABS = ['Plan Details', 'Shared Link', 'Versions', 'Requirements']

const DefaultPlanDetails: FC = () => {
  const {planId} = useParams<{planId: string}>()
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const navigate = useNavigate()
  const [versions, setVersions] = useState<Plan[]>([])
  const [generatingLink, setGeneratingLink] = useState(false)
  const [programRequirements, setProgramRequirements] = useState<any[]>([])
  const [sharedLinkInput, setSharedLinkInput] = useState('');


  useEffect(() => {
  const fetchRequirements = async () => {
    if (!plan?.program) return
    try {
      const response = await getAllRequirements()
      // Filter requirements for this plan's program
      const filtered = response.data.filter((req: any) => req.program === plan.program)
      setProgramRequirements(filtered)
    } catch (err) {
      console.error('Error loading requirements:', err)
    }
  }
  fetchRequirements()
}, [plan?.program])

useEffect(() => {
  const fetchVersions = async () => {
    if (!plan?.program) return
    try {
      const response = await getPlanVersions(plan.program)
      setVersions(response.data)
    } catch (err) {
      console.error('Error loading plan versions:', err)
    }
  }
  fetchVersions()
}, [plan?.program])

const handleGenerateLink = async () => {
  if (!planId) return
  setGeneratingLink(true)
  try {
    // You can let the user choose access_level/expiration_days if needed
    const response = await generateSharedLink(Number(planId), "read")
    setPlan((prev: any) => ({...prev, shared_link: response.data.shareable_link}))
  } catch (err) {
    console.error('Error generating shared link:', err)
    setError('Failed to generate shared link. Please try again.')
  } finally {
    setGeneratingLink(false)
  }
}


  const loadPlanDetails = useCallback(async () => {
    if (!planId || isNaN(Number(planId))) {
      setError('Invalid plan ID.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await getPlanById(Number(planId))
      setPlan(response.data)
    } catch (err) {
      console.error('Error fetching plan details:', err)
      setError('Failed to load plan details. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [planId])

  useEffect(() => {
    loadPlanDetails()
  }, [loadPlanDetails])

  const handleCopyLink = () => {
    if (plan?.shared_link) {
      navigator.clipboard.writeText(plan.shared_link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
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
        {/* Navigation Bar */}
        <ul className="nav nav-tabs mb-5">
          {TABS.map((tab, idx) => (
            <li className="nav-item" key={tab}>
              <button
                className={`nav-link${activeTab === idx ? ' active' : ''}`}
                onClick={() => setActiveTab(idx)}
                type="button"
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>

        {/* Tab Content */}
        {activeTab === 0 && (
          <>
            <h3 className='fw-bold text-dark mb-5'>Plan Details</h3>
            <div className='mb-5'>
              <div><span className='fw-bold'>Plan ID:</span> {plan.id}</div>
              <div><span className='fw-bold'>University:</span> {plan.university}</div>
              <div><span className='fw-bold'>Department:</span> {plan.department}</div>
              <div><span className='fw-bold'>Program:</span> {plan.program}</div>
              <div><span className='fw-bold'>Version:</span> {plan.version}</div>
              <div><span className='fw-bold'>Status:</span> {plan.status}</div>
            </div>
            <h4 className='fw-bold text-dark mb-3'>Semesters</h4>
            {plan.semesters.map((semester: any, index: number) => (
              <div key={semester.id || index} className='mb-4'>
                <h5 className='fw-bold text-gray-800'>{semester.name} (ID: {semester.id})</h5>
                <ul>
                  {semester.courses.map((course: any, i: number) => (
                    <li key={course.id || i}>
                      <div>
                        <span className='fw-bold'>Course ID:</span> {course.id} | <span className='fw-bold'>Code:</span> {course.course_id}
                      </div>
                      <div>
                        <span className='fw-bold'>Title:</span> {course.title}
                      </div>
                      <div>
                        <span className='fw-bold'>Description:</span> {course.description}
                      </div>
                      <div>
                        <span className='fw-bold'>Instructor:</span> {course.instructor}
                      </div>
                      <div>
                        <span className='fw-bold'>Credits:</span> {course.credits}
                      </div>
                      <div>
                        <span className='fw-bold'>Department:</span> {course.department}
                      </div>
                      <div>
                        <span className='fw-bold'>Is Core:</span> {course.is_core ? 'Yes' : 'No'}
                      </div>
                      <div>
                        <span className='fw-bold'>Level:</span> {course.level}
                      </div>
                      <div>
                        <span className='fw-bold'>Prerequisites:</span> {course.prerequisites && course.prerequisites.length > 0 ? course.prerequisites.join(', ') : 'None'}
                      </div>
                      <hr />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}
        {activeTab === 1 && (
          <>
            <h4 className='fw-bold text-dark mb-3'>Shared Link</h4>
            <div className='mb-4'>
              <div className='d-flex align-items-center gap-3'>
                {plan.shared_link ? (
                  <>
                    <input
                      type="text"
                      className="form-control"
                      value={plan.shared_link}
                      readOnly
                      style={{maxWidth: 350}}
                    />
                    <button className="btn btn-light-primary btn-sm" onClick={handleCopyLink}>
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </>
                ) : (
                  <>
                    <span className='text-muted'>No shared link available.</span>
                    <button 
                      className="btn btn-primary btn-sm ms-3" 
                      onClick={handleGenerateLink}
                      disabled={generatingLink}
                    >
                      {generatingLink ? 'Generating...' : 'Generate New Link'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Access a plan by shared link */}
            <div className='mt-5'>
              <h6>Access a Plan by Shared Link</h6>
              <div className='d-flex gap-2'>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Paste shared link here"
                  value={sharedLinkInput}
                  onChange={e => setSharedLinkInput(e.target.value)}
                  style={{maxWidth: 350}}
                />
                <button
                  className="btn btn-light-success btn-sm"
                  onClick={async () => {
                    try {
                      const response = await getPlanBySharedLink(sharedLinkInput)
                      alert('Plan loaded: ' + JSON.stringify(response.data, null, 2))
                    } catch (err) {
                      alert('Invalid or expired shared link.')
                    }
                  }}
                >
                  Load Plan
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 2 && (
          <>
            <h4 className='fw-bold text-dark mb-3'>Versions</h4>
            <div className='mb-5'>
              {versions.length > 0 ? (
                <div className='table-responsive'>
                  <table className='table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3'>
                    <thead>
                      <tr className='fw-bold text-muted'>
                        <th>Version</th>
                        <th>Status</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {versions.map((version) => (
                        <tr key={version.version}>
                          <td>Version {version.version}</td>
                          <td>{version.status}</td>
                          <td>
                            {version.updated_at
                              ? new Date(version.updated_at).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td>
                            <button
                              className='btn btn-sm btn-light-warning'
                              onClick={async () => {
                                if (!plan?.program) return;
                                try {
                                  await restorePlanVersion (plan.program, version.version);
                                  loadPlanDetails();
                                  alert('Plan version restored successfully!');
                                } catch (err) {
                                  alert('Failed to restore plan version.');
                                }
                              }}
                            >
                              Restore this version
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <span className='text-muted'>No versions available.</span>
              )}
            </div>
          </>
        )}

        {activeTab === 3 && (
          <>
            <h4 className='fw-bold text-dark mb-3'>Requirements</h4>
            <div className='mb-5'>
              {programRequirements.length > 0 ? (
                <div className='card card-custom'>
                  <div className='card-body'>
                    <h5 className='card-title'>Program Requirements</h5>
                    <div className='table-responsive'>
                      <table className='table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3'>
                        <thead>
                          <tr className='fw-bold text-muted'>
                            <th>Program</th>
                            <th>Total Hours</th>
                            <th>Core Courses</th>
                            <th>Elective Courses</th>
                            <th>Created At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {programRequirements.map((req) => (
                            <tr key={req.id}>
                              <td>{req.program}</td>
                              <td>{req.total_hours}</td>
                              <td>{req.num_core_courses}</td>
                              <td>{req.num_elective_courses}</td>
                              <td>{req.created_at ? new Date(req.created_at).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <span className='text-muted'>No requirements found for this program.</span>
              )}
            </div>
          </>
        )}
      </KTCardBody>
    </KTCard>
  )
}

export {DefaultPlanDetails}