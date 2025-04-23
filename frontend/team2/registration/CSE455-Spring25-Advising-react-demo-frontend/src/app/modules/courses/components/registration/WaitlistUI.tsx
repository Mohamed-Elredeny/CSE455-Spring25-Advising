import React, { FC, useState, useEffect } from 'react';

interface WaitlistProps {
  courseId: string;
}

const WaitlistUI: FC<WaitlistProps> = ({ courseId }) => {
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);

  useEffect(() => {
    // Fetch waitlist position from backend
    const fetchWaitlistPosition = async () => {
      try {
        const response = await fetch(`/api/waitlist/${courseId}`);
        const data = await response.json();
        setWaitlistPosition(data.position);
      } catch (error) {
        console.error('Error fetching waitlist position:', error);
      }
    };

    fetchWaitlistPosition();
  }, [courseId]);

  return (
    <div className='waitlist-ui'>
      {waitlistPosition !== null ? (
        <p>Your position on the waitlist: {waitlistPosition}</p>
      ) : (
        <p>Loading waitlist position...</p>
      )}
    </div>
  );
};

export default WaitlistUI;