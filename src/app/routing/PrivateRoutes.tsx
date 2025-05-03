import {FC, lazy, Suspense} from 'react'
import {Navigate, Route, Routes} from 'react-router-dom'
import {MasterLayout} from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import {DashboardWrapper} from '../pages/dashboard/DashboardWrapper'
import {getCSSVariableValue} from '../../_metronic/assets/ts/_utils'
import {WithChildren} from '../../_metronic/helpers'
import BuilderPageWrapper from '../pages/layout-builder/BuilderPageWrapper'
import { Lazy } from 'yup'


const PrivateRoutes = () => {
  // Core Features
  const ProfilePage = lazy(() => import('../modules/profile/ProfilePage'))
  const AccountPage = lazy(() => import('../modules/accounts/AccountPage'))
  const GpaSimulatorPage = lazy(() => import('../modules/team3/grade-simulator/pages/GpaSimulatorPage'))
  const CourseModule = lazy(() => import('../modules/courses/CourseModule'))
  const AcademicPlansModule = lazy(() => import('../modules/academic-plans/PlanModule'))
  const UserNotifications = lazy(() => import('../modules/team3/notification/pages/UserDashboard'))
  const AdminNotifications = lazy(() => import('../modules/team3/notification/pages/AdminDashboard'))

  // Admin Features
  const UsersPage = lazy(() => import('../modules/apps/user-management/UsersPage'))
  
  // Optional Features
  const ChatPage = lazy(() => import('../modules/apps/chat/ChatPage'))
  const WizardsPage = lazy(() => import('../modules/wizards/WizardsPage'))
  const WidgetsPage = lazy(() => import('../modules/widgets/WidgetsPage'))

  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {/* Core Routes */}
        <Route path='dashboard' element={<DashboardWrapper />} />
        <Route path='profile/*' element={<SuspensedView><ProfilePage /></SuspensedView>} />
        <Route path='account/*' element={<SuspensedView><AccountPage /></SuspensedView>} />
        <Route path="notifications/*" element={<SuspensedView><UserNotifications userId='student123' /></SuspensedView>} />
        {/* Academic Features */}
        <Route path='academics'>
          <Route path='courses/*' element={<SuspensedView><CourseModule /></SuspensedView>} />
          <Route path='academic-plans/*' element={<SuspensedView><AcademicPlansModule /></SuspensedView>} />
          <Route path='gpa-simulator' element={<SuspensedView><GpaSimulatorPage /></SuspensedView>} />
        </Route>

        {/* Admin Routes */}
        <Route path='admin'>
          <Route path='users/*' element={<SuspensedView><UsersPage /></SuspensedView>} />
          <Route path="/admin" element={<SuspensedView><AdminNotifications/></SuspensedView>} />
        </Route>

        {/* Optional Features */}
        <Route path='features'>
          <Route path='chat/*' element={<SuspensedView><ChatPage /></SuspensedView>} />
          <Route path='wizards/*' element={<SuspensedView><WizardsPage /></SuspensedView>} />
          <Route path='widgets/*' element={<SuspensedView><WidgetsPage /></SuspensedView>} />
        </Route>

        {/* Redirects */}
        <Route path='auth/*' element={<Navigate to='/dashboard' />} />
        <Route index element={<Navigate to='/dashboard' />} />
        
        {/* 404 */}
        <Route path='*' element={<Navigate to='/error/404' />} />
      </Route>
    </Routes>
  )
}

const SuspensedView: FC<WithChildren> = ({children}) => {
  const baseColor = getCSSVariableValue('--bs-primary')
  TopBarProgress.config({
    barColors: {
      '0': baseColor,
    },
    barThickness: 1,
    shadowBlur: 5,
  })
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>
}

export {PrivateRoutes}
