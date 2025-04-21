import React from 'react';

interface ConflictResolutionProps {
  conflicts: Array<{ course_id: string; title: string; reason: string }>;
  onResolve: (course_id: string) => void;
  onIgnore: (course_id: string) => void;
}

const ConflictResolution: React.FC<ConflictResolutionProps> = ({ conflicts, onResolve, onIgnore }) => {
  if (conflicts.length === 0) return null;
  return (
    <div className="conflict-resolution card p-3 mb-4 border-danger">
      <h5 className="mb-3 text-danger">Registration Conflicts</h5>
      <table className="table table-warning">
        <thead>
          <tr>
            <th>Course</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {conflicts.map((conflict) => (
            <tr key={conflict.course_id}>
              <td>{conflict.title} ({conflict.course_id})</td>
              <td>{conflict.reason}</td>
              <td>
                <button className="btn btn-success btn-sm me-2" onClick={() => onResolve(conflict.course_id)}>
                  Resolve
                </button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => onIgnore(conflict.course_id)}>
                  Ignore
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConflictResolution;