import {FC, useState} from 'react'
import {useIntl} from 'react-intl'
import {toAbsoluteUrl} from '../../../_metronic/helpers'
import {PageTitle} from '../../../_metronic/layout/core'
import GpaCalculator from './components/GpaCalculator'
import GraduationStatus from './components/GraduationStatus'
import CourseSimulation from './components/CourseSimulation'

const GpaSimulatorPage: FC = () => {
  const [studentId, setStudentId] = useState('');

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

        {/* GPA Calculator Column */}
        <div className='col-md-6'>
          <div className='card card-flush h-md-100'>
            <div className='card-header'>
              <h3 className='card-title fw-bold text-gray-800'>GPA Calculator</h3>
            </div>
            <div className='card-body pt-1'>
              <GpaCalculator studentId={studentId} />
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
              <CourseSimulation studentId={studentId} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default GpaSimulatorPage