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
    <>
      <Routes>
        <Route element={<Navigate to='/courses/browse' />} path='/' />
        <Route
          path='browse'
          element={
            <>
              <PageTitle>Course Browser</PageTitle>
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
              <PageTitle>Advanced Search</PageTitle>
              <CourseSearch />
            </>
          }
        />
        <Route
          path='prerequisites/:courseId'
          element={
            <>
              <PageTitle>Prerequisite Visualization</PageTitle>
              <PrerequisiteVisualizer />
            </>
          }
        />
        <Route
          path='compare'
          element={
            <>
              <PageTitle>Course Comparison</PageTitle>
              <CourseComparison />
            </>
          }
        />
      </Routes>
    </>
  )
}

export default CourseModule 