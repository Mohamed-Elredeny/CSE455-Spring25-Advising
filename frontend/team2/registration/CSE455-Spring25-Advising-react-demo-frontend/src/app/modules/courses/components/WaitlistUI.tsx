import React, { useState, useEffect } from 'react';
import { getWaitlistPosition } from '../../../api/registrationServiceApi';

interface WaitlistUIProps {
  studentId: string;
  courseId: string;
}

const WaitlistUI: React.FC<WaitlistUIProps> = ({ studentId, courseId }) => {
  const [position, setPosition] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWaitlistPosition = async () => {
      try {
        const data = await getWaitlistPosition(studentId, courseId);
        setPosition(data.position);
      } catch (err) {
        setError('Failed to fetch waitlist position');
      }
    };

    if (studentId && courseId) {
      fetchWaitlistPosition();
    }
  }, [studentId, courseId]);

  return (
    <div className="waitlist-ui">
      <h2>Waitlist Status</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {position !== null ? (
        <p>Your current waitlist position for course {courseId} is: {position}</p>
      ) : (
        <p>No waitlist information available.</p>
      )}
    </div>
  );
};

export default WaitlistUI;
