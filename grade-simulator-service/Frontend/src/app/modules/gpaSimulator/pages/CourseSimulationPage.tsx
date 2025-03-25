import React from 'react';
import CourseSimulation from '../components/CourseSimulation';

const CourseSimulationPage = () => {
  return (
    <div className='card'>
      <div className='card-header border-0 pt-5'>
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bold fs-3 mb-1'>Course Simulation</span>
          <span className='text-muted mt-1 fw-semibold fs-7'>Simulate course grade changes and view potential outcomes</span>
        </h3>
      </div>
      <div className='card-body pt-0'>
        <CourseSimulation studentId="" currentCgpa={null} />
      </div>
    </div>
  );
};

export default CourseSimulationPage; 