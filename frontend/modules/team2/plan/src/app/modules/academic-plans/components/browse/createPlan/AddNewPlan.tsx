import React, {useState} from 'react'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import {Plan, Semester, Course} from '../../../core/_models'
import {
  createPlan, 
  deleteSemester, 
  getAllSemesters, 
  getSemesterById, 
  createSemester,
  createRequirement,
  getAllRequirements,
  updateRequirement,
  deleteRequirement
} from '../../../core/_requests'
import * as XLSX from 'xlsx'

const academicPlanSchema = Yup.object().shape({
  university: Yup.string().required('University is required'),
  department: Yup.string().required('Department is required'),
  program: Yup.string().required('Program is required'),
  version: Yup.number().required('Version is required'),
  status: Yup.string().required('Status is required'),
  semesters: Yup.array().min(1, 'At least one semester is required'),
})



const AddNewPlan: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [createdPlan, setCreatedPlan] = useState<Plan | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [newSemesterName, setNewSemesterName] = useState('')
  const [newSemesterCourses, setNewSemesterCourses] = useState<Course[]>([])
  const [semesterName, setSemesterName] = useState('');
  const [semesterPlanId, setSemesterPlanId] = useState<number>(0);
  const [semestersList, setSemestersList] = useState<any[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<any | null>(null);
  const [semesterCardError, setSemesterCardError] = useState<string | null>(null);
  const [semesterCardLoading, setSemesterCardLoading] = useState(false);
  const [semesterTab, setSemesterTab] = useState<'create' | 'search' | 'all'>('create')
  const [requirementTab, setRequirementTab] = useState<'create' | 'update' | 'all'>('create');
  const [requirementProgram, setRequirementProgram] = useState('');
  const [requirementTotalHours, setRequirementTotalHours] = useState(0);
  const [requirementCore, setRequirementCore] = useState(0);
  const [requirementElective, setRequirementElective] = useState(0);
  const [requirementsList, setRequirementsList] = useState<any[]>([]);
  const [selectedRequirementId, setSelectedRequirementId] = useState<number | null>(null);
  const [selectedRequirement, setSelectedRequirement] = useState<any | null>(null);
  const [requirementCardError, setRequirementCardError] = useState<string | null>(null);
  const [requirementCardLoading, setRequirementCardLoading] = useState(false);
  const [additionalCourse, setAdditionalCourse] = useState<Course>({
    course_id: '',
    title: '',
    description: '',
    instructor: '',
    credits: 0,
    department: '',
    is_core: false,
    level: 100,
    prerequisites: [],
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  

const formik = useFormik<Plan>({
  initialValues: {
    university: '',
    department: '',
    program: '',
    version: 1,
    status: 'PENDING',
    semesters: [],
  },
  validationSchema: academicPlanSchema,
  onSubmit: async (values) => {
    setLoading(true)
    setError(null)
    setCreatedPlan(null)
    try {
      const response = await createPlan({
        university: values.university,
        department: values.department,
        program: values.program,
        semesters: semesters,
      })
      setCreatedPlan(response.data)
      setLoading(false)
    } catch (err: any) {
      setLoading(false)
      setError('Failed to add academic plan. Please try again.')
      console.error(err)
    }
  },
})

  // Add a new course to the courses list
const handleAddCourse = () => {
  if (
    !additionalCourse.course_id ||
    !additionalCourse.title ||
    !additionalCourse.instructor ||
    !additionalCourse.department ||
    additionalCourse.credits <= 0 
  ) {
    setError('Please fill in all required course fields.');
    return;
  }
  setCourses([...courses, additionalCourse]);
  setAdditionalCourse({
    course_id: '',
    title: '',
    description: '',
    instructor: '',
    credits: 0,
    department: '',
    is_core: false,
    level: 100,
    prerequisites: [],
  });
  setError(null);
};

  // Add a new semester with selected courses
const handleAddSemester = () => {
  if (!newSemesterName) {
    setError('Semester name is required.');
    return;
  }
  if (newSemesterCourses.length === 0) {
    setError('Please select at least one course for the semester.');
    return;
  }
  setSemesters([...semesters, {name: newSemesterName, courses: newSemesterCourses}]);
  setNewSemesterName('');
  setNewSemesterCourses([]);
  setError(null);
};

  // Handle Excel upload
  const handleUploadExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target?.result
        const workbook = XLSX.read(data, {type: 'binary'})
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const parsedData = XLSX.utils.sheet_to_json(sheet)
        // You can process parsedData to fill courses/semesters as needed
        alert('Excel file uploaded successfully!')
      }
      reader.readAsBinaryString(file)
    }
  }
  // Create semester
const handleCreateSemester = async () => {
  setSemesterCardError(null);
  setSemesterCardLoading(true);
  try {
    const response = await createSemester({ name: semesterName, academic_plan_id: semesterPlanId });
    setSemestersList([...semestersList, response.data]);
    setSemesterName('');
    setSemesterPlanId(0);
  } catch (err: any) {
    setSemesterCardError('Failed to create semester.');
  } finally {
    setSemesterCardLoading(false);
  }
};

// Delete semester
const handleDeleteSemester = async (id: number) => {
  setSemesterCardError(null);
  setSemesterCardLoading(true);
  try {
    await deleteSemester(id);
    setSemestersList(semestersList.filter(s => s.id !== id));
    if (selectedSemesterId === id) {
      setSelectedSemesterId(null);
      setSelectedSemester(null);
    }
  } catch (err: any) {
    setSemesterCardError('Failed to delete semester.');
  } finally {
    setSemesterCardLoading(false);
  }
};

// Get all semesters
const handleGetAllSemesters = async () => {
  setSemesterCardError(null);
  setSemesterCardLoading(true);
  try {
    const response = await getAllSemesters();
    setSemestersList(response.data);
  } catch (err: any) {
    setSemesterCardError('Failed to fetch semesters.');
  } finally {
    setSemesterCardLoading(false);
  }
};

// Get specific semester
const handleGetSemester = async () => {
  if (!selectedSemesterId) return;
  setSemesterCardError(null);
  setSemesterCardLoading(true);
  try {
    const response = await getSemesterById(selectedSemesterId);
    setSelectedSemester(response.data);
  } catch (err: any) {
    setSemesterCardError('Failed to fetch semester.');
  } finally {
    setSemesterCardLoading(false);
  }
};
 const handleCreateRequirement = async () => {
  setRequirementCardError(null);
  setRequirementCardLoading(true);
  try {
    const response = await createRequirement({
      program: requirementProgram,
      total_hours: requirementTotalHours,
      num_core_courses: requirementCore,
      num_elective_courses: requirementElective,
    });
    setRequirementsList([...requirementsList, response.data]);
    setRequirementProgram('');
    setRequirementTotalHours(0);
    setRequirementCore(0);
    setRequirementElective(0);
  } catch (err) {
    setRequirementCardError('Failed to create requirement.');
  } finally {
    setRequirementCardLoading(false);
  }
};

// Delete requirement
const handleDeleteRequirement = async (id: number) => {
  setRequirementCardError(null);
  setRequirementCardLoading(true);
  try {
    await deleteRequirement(id);
    setRequirementsList(requirementsList.filter(r => r.id !== id));
    if (selectedRequirementId === id) {
      setSelectedRequirementId(null);
      setSelectedRequirement(null);
    }
  } catch (err) {
    setRequirementCardError('Failed to delete requirement.');
  } finally {
    setRequirementCardLoading(false);
  }
};

// Get all requirements
const handleGetAllRequirements = async () => {
  setRequirementCardError(null);
  setRequirementCardLoading(true);
  try {
    const response = await getAllRequirements(0, 100);
    setRequirementsList(response.data);
  } catch (err) {
    setRequirementCardError('Failed to fetch requirements.');
  } finally {
    setRequirementCardLoading(false);
  }
};


  return (
    <>
    <div className='card mb-5 mb-xl-10'>
      <div className='card-header border-0'>
        <div className='card-title m-0'>
          <h3 className='fw-bolder m-0'>Add New Academic Plan</h3>
        </div>
      </div>
      <div className='card-body border-top p-9'>
        {/* Error Section */}
        {error && (
          <div className='alert alert-danger mb-5'>
            <div className='d-flex flex-column'>
              <h4 className='mb-1 text-danger'>Error</h4>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={formik.handleSubmit} noValidate className='form'>
          {/* Section 1: Academic Plan */}
          <h4 className='fw-bold mb-3'>Academic Plan</h4>
          <div className='row mb-4'>
            <div className='col-md-6 mb-3'>
              <label className='form-label'>University</label>
              <input
                type='text'
                className='form-control'
                {...formik.getFieldProps('university')}
              />
              {formik.touched.university && formik.errors.university && (
                <div className='fv-help-block text-danger'>{formik.errors.university}</div>
              )}
            </div>
            <div className='col-md-6 mb-3'>
              <label className='form-label'>Department</label>
              <input
                type='text'
                className='form-control'
                {...formik.getFieldProps('department')}
              />
              {formik.touched.department && formik.errors.department && (
                <div className='fv-help-block text-danger'>{formik.errors.department}</div>
              )}
            </div>
            <div className='col-md-6 mb-3'>
              <label className='form-label'>Program</label>
              <input
                type='text'
                className='form-control'
                {...formik.getFieldProps('program')}
              />
              {formik.touched.program && formik.errors.program && (
                <div className='fv-help-block text-danger'>{formik.errors.program}</div>
              )}
            </div>
          </div>

          {/* Section 2: Semesters */}
          <h4 className='fw-bold mb-3 mt-5'>Semesters</h4>
          <div className='mb-4'>
            <div className='row'>
              <div className='col-md-5 mb-2'>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Semester Name'
                  value={newSemesterName}
                  onChange={(e) => setNewSemesterName(e.target.value)}
                />
              </div>
              <div className='col-md-5 mb-2'>
                <select
                  className='form-select'
                  multiple
                  value={newSemesterCourses.map(c => c.course_id)}
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value)
                    setNewSemesterCourses(courses.filter(c => selected.includes(c.course_id)))
                  }}
                >
                  {courses.map((course, idx) => (
                    <option key={idx} value={course.course_id}>
                      {course.title} ({course.course_id})
                    </option>
                  ))}
                </select>
              </div>
              <div className='col-md-2 mb-2'>
                <button type='button' className='btn btn-light-primary w-100' onClick={handleAddSemester}>
                  Add Semester
                </button>
              </div>
            </div>
            {/* List of added semesters */}
            <ul className='mt-3'>
              {semesters.map((sem, idx) => (
                <li key={idx}>
                  <b>{sem.name}</b> ({sem.courses.length} courses)
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Courses */}
          <h4 className='fw-bold mb-3 mt-5'>Courses</h4>
          <div className='mb-4'>
            <div className='row'>
              <div className='col-md-2 mb-2'>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Course ID'
                  value={additionalCourse.course_id}
                  onChange={e => setAdditionalCourse({...additionalCourse, course_id: e.target.value})}
                />
              </div>
              <div className='col-md-3 mb-2'>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Title'
                  value={additionalCourse.title}
                  onChange={e => setAdditionalCourse({...additionalCourse, title: e.target.value})}
                />
              </div>
              <div className='col-md-3 mb-2'>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Instructor'
                  value={additionalCourse.instructor}
                  onChange={e => setAdditionalCourse({...additionalCourse, instructor: e.target.value})}
                />
              </div>
              <div className='col-md-2 mb-2'>
                <input
                  type='number'
                  className='form-control'
                  placeholder='Credits'
                  value={additionalCourse.credits}
                  onChange={e => setAdditionalCourse({...additionalCourse, credits: Number(e.target.value)})}
                />
              </div>
              <div className='col-md-2 mb-2'>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Department'
                  value={additionalCourse.department}
                  onChange={e => setAdditionalCourse({...additionalCourse, department: e.target.value})}
                />
              </div>
              <div className='col-md-2 mb-2'>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Description'
                  value={additionalCourse.description}
                  onChange={e => setAdditionalCourse({...additionalCourse, description: e.target.value})}
                />
              </div>
              <div className='col-md-2 mb-2'>
                <input
                  type='number'
                  className='form-control'
                  placeholder='Level'
                  value={additionalCourse.level}
                  onChange={e => setAdditionalCourse({...additionalCourse, level: Number(e.target.value)})}
                />
              </div>
              <div className='col-md-2 mb-2'>
                <select
                  className='form-select'
                  value={additionalCourse.is_core ? 'true' : 'false'}
                  onChange={e => setAdditionalCourse({...additionalCourse, is_core: e.target.value === 'true'})}
                >
                  <option value='false'>Elective</option>
                  <option value='true'>Core</option>
                </select>
              </div>
              <div className='col-md-3 mb-2'>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Prerequisites (comma separated)'
                  value={additionalCourse.prerequisites.join(',')}
                  onChange={e => setAdditionalCourse({...additionalCourse, prerequisites: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                />
              </div>
              <div className='col-md-2 mb-2'>
                <button type='button' className='btn btn-light-primary w-100' onClick={handleAddCourse}>
                  Add Course
                </button>
              </div>
            </div>
            {/* List of added courses */}
            <ul className='mt-3'>
              {courses.map((c, idx) => (
                <li key={idx}>
                  <b>{c.title}</b> ({c.course_id}) - {c.credits} credits
                </li>
              ))}
            </ul>
          </div>

          {/* Section 4: Upload via Excel */}
          <h4 className='fw-bold mb-3 mt-5'>Upload Plan via Excel</h4>
          <div className='mb-4'>
            <input
              type='file'
              className='form-control'
              accept='.xlsx, .xls'
              onChange={handleUploadExcel}
            />
          </div>

          {/* Create Plan Button */}
          <div className='d-flex justify-content-end mt-5'>
            <button type='submit' className='btn btn-primary' disabled={loading}>
              {!loading ? 'Create Plan' : (
                <span className='indicator-progress' style={{display: 'block'}}>
                  Please wait...{' '}
                  <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                </span>
              )}
            </button>
          </div>
        </form>
        {createdPlan && (
          <div className="alert alert-success mt-5">
            <h5>Plan Created:</h5>
            <pre>{JSON.stringify(createdPlan, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
    <div className="card mb-5"></div>
         {/* Semester Management Card */}
      <div className="card mb-5">
        <div className="card-header border-0">
          <div className="card-title m-0">
            <h3 className="fw-bolder m-0">Semester Management</h3>
          </div>
        </div>
        <div className="card-body border-top p-9">
          {semesterCardError && (
            <div className="alert alert-danger mb-3">{semesterCardError}</div>
          )}

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${semesterTab === 'create' ? 'active' : ''}`}
                onClick={() => setSemesterTab('create')}
              >
                Create Semester
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${semesterTab === 'search' ? 'active' : ''}`}
                onClick={() => setSemesterTab('search')}
              >
                Search Semester
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${semesterTab === 'all' ? 'active' : ''}`}
                onClick={() => setSemesterTab('all')}
              >
                All Semesters
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          {semesterTab === 'create' && (
            <div className="mb-4">
              <h5>Create Semester</h5>
              <div className="row g-3 align-items-center">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Semester Name"
                    value={semesterName}
                    onChange={e => setSemesterName(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Academic Plan ID"
                    value={semesterPlanId}
                    onChange={e => setSemesterPlanId(Number(e.target.value))}
                  />
                </div>
                <div className="col-md-4">
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateSemester}
                    disabled={semesterCardLoading}
                  >
                    {semesterCardLoading ? 'Creating...' : 'Create Semester'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search Semester Tab */}
          {semesterTab === 'search' && (
            <div className="mb-4">
              <h5>Search for Semester</h5>
              <div className="row g-3 align-items-center">
                <div className="col-md-4">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Semester ID"
                    value={selectedSemesterId ?? ''}
                    onChange={e => setSelectedSemesterId(Number(e.target.value))}
                  />
                </div>
                <div className="col-md-4">
                  <button
                    className="btn btn-light-success"
                    onClick={handleGetSemester}
                    disabled={semesterCardLoading || !selectedSemesterId}
                  >
                    {semesterCardLoading ? 'Loading...' : 'Get Semester'}
                  </button>
                </div>
              </div>
              {selectedSemester === null && selectedSemesterId && !semesterCardLoading && (
                <div className="mt-3 alert alert-warning">
                  Semester not found.
                </div>
              )}
              {selectedSemester && (
                <div className="mt-3 alert alert-info">
                  <div><b>Name:</b> {selectedSemester.name}</div>
                  <div><b>Academic Plan ID:</b> {selectedSemester.academic_plan_id}</div>
                  <div><b>ID:</b> {selectedSemester.id}</div>
                  <div><b>Courses:</b> {selectedSemester.courses.length}</div>
                </div>
              )}
            </div>
          )}

          {/* All Semesters Tab */}
          {semesterTab === 'all' && (
            <div className="mb-4">
              <h5>All Semesters</h5>
              <button
                className="btn btn-light-info mb-2"
                onClick={handleGetAllSemesters}
                disabled={semesterCardLoading}
              >
                {semesterCardLoading ? 'Loading...' : 'Get All Semesters'}
              </button>
              <div className="table-responsive">
                <table className="table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3">
                  <thead>
                    <tr className="fw-bold text-muted">
                      <th>ID</th>
                      <th>Name</th>
                      <th>Academic Plan ID</th>
                      <th>Courses</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {semestersList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-muted">No semesters found.</td>
                      </tr>
                    ) : (
                      semestersList.map(s => (
                        <tr key={s.id}>
                          <td>{s.id}</td>
                          <td>{s.name}</td>
                          <td>{s.academic_plan_id}</td>
                          <td>{s.courses?.length ?? 0}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteSemester(s.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Requirements Management Card */}
        <div className="card mb-5">
          <div className="card-header border-0">
            <div className="card-title m-0">
              <h3 className="fw-bolder m-0">Requirements Management</h3>
            </div>
          </div>
          <div className="card-body border-top p-9">
            {requirementCardError && (
              <div className="alert alert-danger mb-3">{requirementCardError}</div>
            )}

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${requirementTab === 'create' ? 'active' : ''}`}
                  onClick={() => setRequirementTab('create')}
                >
                  Create Requirement
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${requirementTab === 'update' ? 'active' : ''}`}
                  onClick={() => setRequirementTab('update')}
                >
                  Update Requirement
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${requirementTab === 'all' ? 'active' : ''}`}
                  onClick={() => setRequirementTab('all')}
                >
                  All Requirements
                </button>
              </li>
            </ul>

            {/* Create Requirement Tab */}
            {requirementTab === 'create' && (
              <div className="mb-4">
                <h5>Create Requirement</h5>
                <div className="row g-3 align-items-center">
                  <div className="col-md-3">
                    <label className="form-label">Program</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Program"
                      value={requirementProgram}
                      onChange={e => setRequirementProgram(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Total Hours</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Total Hours"
                      value={requirementTotalHours}
                      onChange={e => setRequirementTotalHours(Number(e.target.value))}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Core Courses</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Core Courses"
                      value={requirementCore}
                      onChange={e => setRequirementCore(Number(e.target.value))}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Elective Courses</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Elective Courses"
                      value={requirementElective}
                      onChange={e => setRequirementElective(Number(e.target.value))}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label" style={{visibility: 'hidden'}}>Create</label>
                    <button
                      className="btn btn-primary w-100"
                      onClick={handleCreateRequirement}
                      disabled={requirementCardLoading}
                    >
                      {requirementCardLoading ? 'Creating...' : 'Create Requirement'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Update Requirement Tab */}
            {requirementTab === 'update' && (
              <div className="mb-4">
                <h5>Update Requirement</h5>
                <div className="row g-3 align-items-center mb-3">
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={selectedRequirementId ?? ''}
                      onChange={e => {
                        const id = Number(e.target.value);
                        setSelectedRequirementId(id);
                        const req = requirementsList.find(r => r.id === id);
                        setSelectedRequirement(req ? {...req} : null);
                      }}
                    >
                      <option value="">Select Requirement ID</option>
                      {requirementsList.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.id} - {r.program}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {selectedRequirement && (
                  <div className="row g-3 align-items-center">
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Program"
                        value={selectedRequirement.program}
                        onChange={e => setSelectedRequirement({...selectedRequirement, program: e.target.value})}
                      />
                    </div>
                    <div className="col-md-2">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Total Hours"
                        value={selectedRequirement.total_hours}
                        onChange={e => setSelectedRequirement({...selectedRequirement, total_hours: Number(e.target.value)})}
                      />
                    </div>
                    <div className="col-md-2">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Core Courses"
                        value={selectedRequirement.num_core_courses}
                        onChange={e => setSelectedRequirement({...selectedRequirement, num_core_courses: Number(e.target.value)})}
                      />
                    </div>
                    <div className="col-md-2">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Elective Courses"
                        value={selectedRequirement.num_elective_courses}
                        onChange={e => setSelectedRequirement({...selectedRequirement, num_elective_courses: Number(e.target.value)})}
                      />
                    </div>
                    <div className="col-md-3">
                      <button
                        className="btn btn-warning"
                        onClick={async () => {
                          setRequirementCardError(null);
                          setRequirementCardLoading(true);
                          try {
                            await updateRequirement(selectedRequirement.id, {
                              program: selectedRequirement.program,
                              total_hours: selectedRequirement.total_hours,
                              num_core_courses: selectedRequirement.num_core_courses,
                              num_elective_courses: selectedRequirement.num_elective_courses,
                            });
                            // Update local list
                            setRequirementsList(requirementsList.map(r =>
                              r.id === selectedRequirement.id ? {...selectedRequirement} : r
                            ));
                          } catch (err) {
                            setRequirementCardError('Failed to update requirement.');
                          } finally {
                            setRequirementCardLoading(false);
                          }
                        }}
                        disabled={requirementCardLoading}
                      >
                        {requirementCardLoading ? 'Updating...' : 'Update Requirement'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* All Requirements Tab */}
            {requirementTab === 'all' && (
              <div className="mb-4">
                <h5>All Requirements</h5>
                <button
                  className="btn btn-light-info mb-2"
                  onClick={handleGetAllRequirements}
                  disabled={requirementCardLoading}
                >
                  {requirementCardLoading ? 'Loading...' : 'Get All Requirements'}
                </button>
                <div className="table-responsive">
                  <table className="table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3">
                    <thead>
                      <tr className="fw-bold text-muted">
                        <th>ID</th>
                        <th>Program</th>
                        <th>Total Hours</th>
                        <th>Core Courses</th>
                        <th>Elective Courses</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requirementsList.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center text-muted">No requirements found.</td>
                        </tr>
                      ) : (
                        requirementsList.map(r => (
                          <tr key={r.id}>
                            <td>{r.id}</td>
                            <td>{r.program}</td>
                            <td>{r.total_hours}</td>
                            <td>{r.num_core_courses}</td>
                            <td>{r.num_elective_courses}</td>
                            <td>{r.created_at ? new Date(r.created_at).toLocaleString() : ''}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteRequirement(r.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
    </>
  )
}

export {AddNewPlan}