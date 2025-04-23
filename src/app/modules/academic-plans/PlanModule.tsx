import {FC} from 'react'
import {Routes, Route, Navigate} from 'react-router-dom'
import {PageTitle} from '../../../_metronic/layout/core'
import {AcademicPlansBrowser} from './components/browse/ProgramPlans'
import {StudentPlans} from './components/allPlans/StudentPlans'
import {PlanRevision} from './components/revision/PlanRevision'
import {PlanComparison} from './components/comparison/PlanCompare'
import {AddNewPlan} from './components/browse/createPlan/AddNewPlan'
import {PlanDetails} from './components/revision/details/PlanDetails'
import {DefaultPlanDetails} from './components/browse/defaultDetails/DefaultPlanDetails'
import {StudentPlanDetails} from './components/allPlans/studentDetails/StudentPlanDetails'

const AcademicPlansModule: FC = () => {
  return (
    <Routes>
      {/* Default redirect */}
      <Route index element={<Navigate to='browse' />} />

      {/* Plans Discovery */}
      <Route
        path='browse'
        element={
          <>
            <PageTitle>Programs Plan</PageTitle>
            <AcademicPlansBrowser />
          </>
        }
      />
      <Route
        path='allPlans'
        element={
          <>
            <PageTitle>Student Plans</PageTitle>
            <StudentPlans />
          </>
        }
      />
      <Route
        path='revision'
        element={
          <>
            <PageTitle>Plans Revision</PageTitle>
            <PlanRevision />
          </>
        }
      />
      <Route
        path='comparison'
        element={
          <>
            <PageTitle>Compare Plans</PageTitle>
            <PlanComparison />
          </>
        }
      />

      <Route
        path='new'
        element={
          <>
            <PageTitle>New Academic Plan</PageTitle>
            <AddNewPlan />
          </>
        }
      />

      <Route
        path='revisionDetails/:planId'
        element={
          <>
            <PageTitle>Plan Details</PageTitle>
            <PlanDetails />
          </>
        }
      />

      <Route
        path='browseDetails/:planId'
        element={
          <>
            <PageTitle>Plan Details</PageTitle>
            <DefaultPlanDetails />
          </>
        }
      />

      <Route
        path='studentDetails/:planId'
        element={
          <>
            <PageTitle>Plan Details</PageTitle>
            <StudentPlanDetails />
          </>
        }
      />

      {/* Fallback */}
      <Route path='*' element={<Navigate to='browse' />} />
    </Routes>
  )
}

export default AcademicPlansModule 