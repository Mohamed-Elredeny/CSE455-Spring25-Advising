import {FC} from 'react'
import {useIntl} from 'react-intl'
import {toAbsoluteUrl} from '../../../_metronic/helpers'
import {PageTitle} from '../../../_metronic/layout/core'
import GpaCalculator from './components/GpaCalculator'
import GraduationStatus from './components/GraduationStatus'

const GpaSimulatorPage: FC = () => {
  return (
    <>
      <PageTitle>GPA Simulator</PageTitle>
      <div className='row g-5'>
        {/* GPA Calculator Column */}
        <div className='col-md-6'>
          <div className='card card-flush h-md-100'>
            <div className='card-header'>
              <h3 className='card-title fw-bold text-gray-800'>GPA Calculator</h3>
            </div>
            <div className='card-body pt-1'>
              <GpaCalculator />
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
              <GraduationStatus />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default GpaSimulatorPage