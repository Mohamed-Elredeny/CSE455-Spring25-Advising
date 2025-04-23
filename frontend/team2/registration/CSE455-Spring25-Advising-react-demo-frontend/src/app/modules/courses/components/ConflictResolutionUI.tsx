import React from 'react';

interface Conflict {
  id: string;
  description: string;
  resolved: boolean;
}

interface ConflictResolutionUIProps {
  conflicts: Conflict[];
  onResolve?: (conflictId: string) => void;
}

const ConflictResolutionUI: React.FC<ConflictResolutionUIProps> = ({ conflicts, onResolve }) => {
  const handleResolve = (id: string) => {
    if (onResolve) {
      onResolve(id);
    }
  };

  return (
    <div className="conflict-resolution-ui">
      <h2>Conflict Resolution</h2>
      {conflicts.length === 0 ? (
        <p>No conflicts detected.</p>
      ) : (
        <ul>
          {conflicts.map(conflict => (
            <li key={conflict.id} style={{ marginBottom: '10px' }}>
              <p>{conflict.description}</p>
              {!conflict.resolved && (
                <button onClick={() => handleResolve(conflict.id)}>Mark as Resolved</button>
              )}
              {conflict.resolved && <span>Resolved</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ConflictResolutionUI;
