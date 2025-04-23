import React, {useState} from 'react'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import {Plan, Semester, Course} from '../../../core/_models'
import {mockPlans} from '../../mockData/mockPlansData'
import * as XLSX from 'xlsx'

const academicPlanSchema = Yup.object().shape({
  university: Yup.string().required('University is required'),
  program: Yup.string().required('Program is required'),
  level: Yup.number().required('Level is required'),
  version: Yup.number().required('Version is required'),
  semesters: Yup.array().min(1, 'At least one semester is required'),
})

const AddNewPlan: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>(mockPlans) // Use mock data
  const [semesters, setSemesters] = useState<Semester[]>([]) // Manage semesters
  const [selectedSemesters, setSelectedSemesters] = useState<Semester[]>([]) // Selected semesters for the plan
  const [courses, setCourses] = useState<Course[]>([]) // Manage courses for new semesters
  const [newSemesterName, setNewSemesterName] = useState('') // Name for the new semester
  const [newSemesterCourses, setNewSemesterCourses] = useState<Course[]>([]) // Courses for the new semester
  const [additionalCourses, setAdditionalCourses] = useState<Course[]>([]) // State for additional course dropdowns
  const [loading, setLoading] = useState(false) // Loading state for form submission

  const formik = useFormik<Plan>({
    initialValues: {
      plan_id: plans.length + 1, // Auto-generate plan ID
      university: '',
      program: '',
      version: 1,
      status: 'PENDING',
      semesters: [],
    },
    validationSchema: academicPlanSchema,
    onSubmit: (values) => {
      setLoading(true)
      setTimeout(() => {
        // Add the new plan to the mock data
        setPlans([...plans, {...values, semesters: selectedSemesters}])
        setLoading(false)
        alert('Academic plan added successfully!')
      }, 1000)
    },
  })

  const handleAddCourseToSemester = (course: Course) => {
    // Add the selected course directly to the newSemesterCourses array
    setNewSemesterCourses([...newSemesterCourses, course])
  }

  const handleSaveNewSemester = () => {
    const newSemester: Semester = {
      name: newSemesterName,
      courses: newSemesterCourses, // Use Course objects directly
    }

    setSemesters([...semesters, newSemester])
    setNewSemesterName('')
    setNewSemesterCourses([])
    alert('New semester added successfully!')
  }

  const handleAddSemesterDropdown = () => {
    setSelectedSemesters([...selectedSemesters, {name: '', courses: []}])
  }

  const handleSemesterChange = (index: number, semesterName: string) => {
    const updatedSemesters = [...selectedSemesters]
    updatedSemesters[index].name = semesterName
    setSelectedSemesters(updatedSemesters)
  }

  const handleAddCourseDropdown = () => {
    setAdditionalCourses([
      ...additionalCourses,
      {
        course_id: '',
        title: '',
        description: '',
        instructor: '',
        credits: 0,
        department: '',
        is_core: false, // Default value for is_core
        prerequisites: [], // Default empty array for prerequisites
        sections: [], // Default empty array for sections
        categories: [], // Default empty array for categories
      },
    ])
  }
  
  const handleCourseChange = (index: number, courseId: string) => {
    const updatedCourses = [...additionalCourses]
    updatedCourses[index].course_id = courseId
    setAdditionalCourses(updatedCourses)
  }

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
        console.log('Parsed Excel Data:', parsedData)
        alert('Excel file uploaded successfully!')
      }
      reader.readAsBinaryString(file)
    }
  }

  return (
    <div>
      {/* Main Card for Adding Academic Plan */}
      <div className='card mb-5 mb-xl-10'>
        <div className='card-header border-0'>
          <div className='card-title m-0'>
            <h3 className='fw-bolder m-0'>Add New Academic Plan</h3>
          </div>
        </div>

        <div className='card-body border-top p-9'>
          <form onSubmit={formik.handleSubmit} noValidate className='form'>
            {/* University */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label required fw-bold fs-6'>University</label>
              <div className='col-lg-8'>
                <input
                  type='text'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='Enter University Name'
                  {...formik.getFieldProps('university')}
                />
                {formik.touched.university && formik.errors.university && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.university}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Program */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label required fw-bold fs-6'>Program</label>
              <div className='col-lg-8'>
                <select
                  className='form-select form-select-lg form-select-solid'
                  {...formik.getFieldProps('program')}
                >
                  <option value=''>Select Program</option>
                  <option value='Computer Science'>Computer Science</option>
                  <option value='Engineering'>Engineering</option>
                  <option value='Business'>Business</option>
                </select>
                {formik.touched.program && formik.errors.program && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.program}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Semesters */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label fw-bold fs-6'>Semesters</label>
              <div className='col-lg-8'>
                {selectedSemesters.map((semester, index) => (
                  <div key={index} className='mb-3'>
                    <select
                      className='form-select form-select-lg form-select-solid'
                      value={semester.name}
                      onChange={(e) => handleSemesterChange(index, e.target.value)}
                    >
                      <option value=''>Select Semester</option>
                      {semesters.map((sem, i) => (
                        <option key={i} value={sem.name}>
                          {sem.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <button
                  type='button'
                  className='btn btn-light-primary'
                  onClick={handleAddSemesterDropdown}
                >
                  Add Semester
                </button>
              </div>
            </div>

            {/* Upload Plan as Excel */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label fw-bold fs-6'>Upload Plan (Excel)</label>
              <div className='col-lg-8'>
                <input
                  type='file'
                  className='form-control form-control-lg form-control-solid'
                  accept='.xlsx, .xls'
                  onChange={handleUploadExcel}
                />
              </div>
            </div>

            <div className='card-footer d-flex justify-content-end py-6 px-9'>
              <button type='submit' className='btn btn-primary' disabled={loading}>
                {!loading && 'Add Plan'}
                {loading && (
                  <span className='indicator-progress' style={{display: 'block'}}>
                    Please wait...{' '}
                    <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Card for Adding New Semester */}
      <div className='card mb-5 mb-xl-10'>
        <div className='card-header border-0'>
          <div className='card-title m-0'>
            <h3 className='fw-bolder m-0'>Add New Semester</h3>
          </div>
        </div>

        <div className='card-body border-top p-9'>
          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label fw-bold fs-6'>Semester Name</label>
            <div className='col-lg-8'>
              <input
                type='text'
                className='form-control form-control-lg form-control-solid'
                placeholder='Enter Semester Name'
                value={newSemesterName}
                onChange={(e) => setNewSemesterName(e.target.value)}
              />
            </div>
          </div>

          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label fw-bold fs-6'>Courses</label>
                <div className='col-lg-8'>
                    {additionalCourses.map((course, index) => (
                        <div key={index} className='mb-3'>
                            <select
                                className='form-select form-select-lg form-select-solid'
                                value={course.course_id}
                                onChange={(e) => handleCourseChange(index, e.target.value)}
                                >
                                <option value=''>Select Course</option>
                                {courses.map((c, i) => (
                                    <option key={i} value={c.course_id}>
                                        {c.title}
                                    </option>
                                ))}
                            </select>
            </div>
    ))}
    <button
      type='button'
      className='btn btn-light-primary'
      onClick={handleAddCourseDropdown}
    >
      Add Course
    </button>
  </div>
</div>

          <div className='card-footer d-flex justify-content-end py-6 px-9'>
            <button
              type='button'
              className='btn btn-primary'
              onClick={handleSaveNewSemester}
            >
              Add Semester
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export {AddNewPlan}