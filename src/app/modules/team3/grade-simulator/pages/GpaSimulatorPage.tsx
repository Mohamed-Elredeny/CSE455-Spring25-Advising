import {FC, useState, useEffect} from 'react'
import {useIntl} from 'react-intl'
import {toAbsoluteUrl} from '../../../../../_metronic/helpers'
import {PageTitle} from '../../../../../_metronic/layout/core'
import GpaCalculator from '../components/GpaCalculator'
import GraduationStatus from '../components/GraduationStatus'
import CourseSimulation from '../components/CourseSimulation'
import { calculateCGPA } from '../Api/index'
import { KTIcon } from '../../../../../_metronic/helpers'

const GpaSimulatorPage: FC = () => {
  const [studentId, setStudentId] = useState('');
  const [currentCgpa, setCurrentCgpa] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCurrentCGPA = async () => {
      if (!studentId) {
        setCurrentCgpa(null);
        setError('');
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        const response = await calculateCGPA(studentId);
        
        if (response?.data?.cgpa !== undefined && response.data.cgpa !== null) {
          setCurrentCgpa(Number(response.data.cgpa));
        } else {
          setError('No CGPA data available for this student');
          setCurrentCgpa(null);
        }
      } catch (error: any) {
        console.error('Error calculating CGPA:', error);
        if (error.response?.status === 404) {
          setError('Student not found. Please check the Student ID');
        } else {
          setError('Failed to calculate CGPA. Please try again later.');
        }
        setCurrentCgpa(null);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchCurrentCGPA();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [studentId]);

  return (
    <>
      <PageTitle>GPA Simulator</PageTitle>
      <div className='row g-5 pt-5 mt-5 mx-4'>
        {/* Student ID Input */}
        <div className='col-12'>
          <div className='card card-flush'>
            <div className='card-header'>
              <h3 className='card-title fw-bold text-gray-800'>Student Information</h3>
            </div>
            <div className='card-body pt-1'>
              <div className='row align-items-end'>
                <div className='col-md-6'>
                  <label className='form-label'>Student ID</label>
                  <input
                    type='text'
                    className='form-control form-control-solid'
                    placeholder='Enter Student ID'
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className='col-12'>
            <div className='alert alert-danger d-flex align-items-center p-5'>
              <KTIcon iconName='cross-circle' className='fs-2hx text-danger me-3' />
              <div className='d-flex flex-column'>
                <h4 className='mb-1 text-dark'>Error</h4>
                <span>{error}</span>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className='col-12'>
            <div className='alert alert-info d-flex align-items-center p-5'>
              <KTIcon iconName='spinner' className='fs-2hx text-info me-3' />
              <div className='d-flex flex-column'>
                <h4 className='mb-1 text-dark'>Loading</h4>
                <span>Fetching student data...</span>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && studentId && (
          <>
            {/* GPA Calculator Column */}
            <div className='col-md-6'>
              <div className='card card-flush h-md-100'>
                <div className='card-header'>
                  <h3 className='card-title fw-bold text-gray-800'>GPA Calculator</h3>
                </div>
                <div className='card-body pt-1'>
                  <GpaCalculator studentId={studentId} currentCgpa={currentCgpa} />
                </div>
              </div>
            </div>

            {/* Graduation Status Column */}
            <div className='col-md-6'>
              <div className='card card-flush h-md-100'>
                <div className='card-header'>
                  <h3 className='card-title fw-bold text-gray-800'>Graduation Status</h3>
                </div>
                <div className='card-body pt-1'>
                  <GraduationStatus studentId={studentId} />
                </div>
              </div>
            </div>

            {/* Course Simulation Section - Full Width */}
            <div className='col-12'>
              <div className='card card-flush'>
                <div className='card-header'>
                  <h3 className='card-title fw-bold text-gray-800'>Course Simulation</h3>
                </div>
                <div className='card-body pt-1'>
                  <CourseSimulation studentId={studentId} currentCgpa={currentCgpa} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default GpaSimulatorPage