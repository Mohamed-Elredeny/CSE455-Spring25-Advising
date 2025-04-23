import React, { FC, useState } from 'react';

interface ConflictResolutionProps {
  conflicts: string[];
}

const ConflictResolutionUI: FC<ConflictResolutionProps> = ({ conflicts }) => {
  const [resolved, setResolved] = useState<boolean>(false);

  const handleResolve = () => {
    // Logic to resolve conflicts
    setResolved(true);
  };

  return (
    <div className='conflict-resolution-ui'>
      {resolved ? (
        <p>All conflicts have been resolved.</p>
      ) : (
        <div>
          <h4>Schedule Conflicts:</h4>
          <ul>
            {conflicts.map((conflict, index) => (
              <li key={index}>{conflict}</li>
            ))}
          </ul>
          <button onClick={handleResolve}>Resolve Conflicts</button>
        </div>
      )}
    </div>
  );
};

export default ConflictResolutionUI;