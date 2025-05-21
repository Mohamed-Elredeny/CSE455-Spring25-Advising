import {FC} from 'react'
import {Routes, Route, Navigate} from 'react-router-dom'
import {PageTitle} from '../../../_metronic/layout/core'
import {CourseBrowser} from './components/browse/CourseBrowser'
import {CourseCategories} from './components/categories/CourseCategories'
import {CourseSearch} from './components/search/CourseSearch'
import {PrerequisiteVisualizer} from './components/prerequisites/PrerequisiteVisualizer'
import {CourseComparison} from './components/comparison/CourseComparison'

const CourseModule: FC = () => {
  return (
    <Routes>
      {/* Default redirect */}
      <Route index element={<Navigate to='browse' />} />

      {/* Course Discovery */}
      <Route
        path='browse'
        element={
          <>
            <PageTitle>Course Catalog</PageTitle>
            <CourseBrowser />
          </>
        }
      />
      <Route
        path='categories'
        element={
          <>
            <PageTitle>Course Categories</PageTitle>
            <CourseCategories />
          </>
        }
      />
      <Route
        path='search'
        element={
          <>
            <PageTitle>Course Search</PageTitle>
            <CourseSearch />
          </>
        }
      />

      {/* Course Analysis */}
      <Route
        path='prerequisites/:courseId'
        element={
          <>
            <PageTitle>Course Prerequisites</PageTitle>
            <PrerequisiteVisualizer />
          </>
        }
      />
      <Route
        path='compare'
        element={
          <>
            <PageTitle>Compare Courses</PageTitle>
            <CourseComparison />
          </>
        }
      />

      {/* Fallback */}
      <Route path='*' element={<Navigate to='browse' />} />
    </Routes>
  )
}

export default CourseModule 