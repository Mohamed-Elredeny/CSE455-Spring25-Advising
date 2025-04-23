import React from 'react';

interface ConfirmationUIProps {
  registrationId: string;
  courseId: string;
  studentId: string;
  semester: string;
  status: string;
}

const ConfirmationUI: React.FC<ConfirmationUIProps> = ({
  registrationId,
  courseId,
  studentId,
  semester,
  status,
}) => {
  return (
    <div className="confirmation-ui">
      <h2>Registration Confirmation</h2>
      <p><strong>Registration ID:</strong> {registrationId}</p>
      <p><strong>Course ID:</strong> {courseId}</p>
      <p><strong>Student ID:</strong> {studentId}</p>
      <p><strong>Semester:</strong> {semester}</p>
      <p><strong>Status:</strong> {status}</p>
    </div>
  );
};

export default ConfirmationUI;
