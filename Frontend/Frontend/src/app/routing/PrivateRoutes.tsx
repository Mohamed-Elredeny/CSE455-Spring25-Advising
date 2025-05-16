import {lazy, FC, Suspense} from 'react'
import {Route, Routes, Navigate} from 'react-router-dom'
import {MasterLayout} from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'

import {MenuTestPage} from '../pages/MenuTestPage'
import {getCSSVariableValue} from '../../_metronic/assets/ts/_utils'
import {WithChildren} from '../../_metronic/helpers'

const PrivateRoutes = () => {
  const WidgetsPage = lazy(() => import('../modules/widgets/WidgetsPage'))
  const UsersPage = lazy(() => import('../modules/apps/user-management/UsersPage'))
  const Chat = lazy(() => import('../pages/Chat'))

  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {/* Redirect to Private Chat page after success login/registration */}
        <Route path='auth/*' element={<Navigate to='/chat/private' />} />
        
        {/* Pages */}
        <Route path='menu-test' element={<MenuTestPage />} />

        {/* Chat Routes */}
        <Route
          path='chat/private'
          element={
            <SuspensedView>
              <Chat />
            </SuspensedView>
          }
        />

        {/* Lazy Modules */}
        <Route
          path='crafted/widgets/*'
          element={
            <SuspensedView>
              <WidgetsPage />
            </SuspensedView>
          }
        />
     
        <Route
          path='apps/user-management/*'
          element={
            <SuspensedView>
              <UsersPage />
            </SuspensedView>
          }
        />

        {/* Page Not Found */}
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