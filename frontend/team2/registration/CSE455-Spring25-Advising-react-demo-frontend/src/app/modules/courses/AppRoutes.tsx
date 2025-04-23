import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RegistrationUI from './components/registration/RegistrationUI';
import ScheduleVisualizationUI from './components/ScheduleVisualizationUI';
import ConfirmationUI from './components/ConfirmationUI';
import WaitlistUI from './components/WaitlistUI';
import ConflictResolutionUI from './components/ConflictResolutionUI';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/register" element={<RegistrationUI />} />
      <Route path="/schedule" element={<ScheduleVisualizationUI sections={[]} />} />
      <Route path="/confirmation" element={
        <ConfirmationUI
          registrationId="12345"
          courseId="CS101"
          studentId="S123"
          semester="Spring 2025"
          status="confirmed"
        />
      } />
      <Route path="/waitlist" element={<WaitlistUI studentId="S123" courseId="CS101" />} />
      <Route path="/conflicts" element={<ConflictResolutionUI conflicts={[]} />} />
    </Routes>
  );
};

export default AppRoutes;
