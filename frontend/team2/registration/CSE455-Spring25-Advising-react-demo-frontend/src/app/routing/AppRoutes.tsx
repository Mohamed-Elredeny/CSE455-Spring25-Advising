import CourseModule from '../../modules/courses/CourseModule';
import {FC} from 'react'
import {Routes, Route, BrowserRouter, Navigate} from 'react-router-dom'
import {PrivateRoutes} from './PrivateRoutes'
import {ErrorsPage} from '../modules/errors/ErrorsPage'
import {Logout, AuthPage, useAuth} from '../modules/auth'
import {App} from '../App'
import AccountPage from '../modules/accounts/AccountPage';
import ProfilePage from '../modules/profile/ProfilePage';
import WaitlistUI from '../modules/courses/components/WaitlistUI';
import ConflictResolutionUI from '../modules/courses/components/ConflictResolutionUI';

/**
 * Base URL of the website.
 *
 * @see https://facebook.github.io/create-react-app/docs/using-the-public-folder
 */
const {BASE_URL} = import.meta.env

const AppRoutes: FC = () => {
  const {currentUser} = useAuth()
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          {currentUser ? (
            <>
              <Route path='/*' element={<PrivateRoutes />} />
              <Route path='courses/*' element={<CourseModule />} />
              <Route index element={<Navigate to='/dashboard' />} />
            </>
          ) : (
            <>
              <Route path='auth/*' element={<AuthPage />} />
              <Route path='account/*' element={<AccountPage />} />
              <Route path='profile/*' element={<ProfilePage />} />
              <Route path='*' element={<Navigate to='/auth' />} />
            </>
          )}
          <Route path='error/*' element={<ErrorsPage />} />
          <Route path='logout' element={<Logout />} />
              <Route path='waitlist' element={<WaitlistUI courseId='some-course-id' studentId='some-student-id' />} />
          <Route path='conflicts' element={<ConflictResolutionUI conflicts={[]} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export {AppRoutes}
