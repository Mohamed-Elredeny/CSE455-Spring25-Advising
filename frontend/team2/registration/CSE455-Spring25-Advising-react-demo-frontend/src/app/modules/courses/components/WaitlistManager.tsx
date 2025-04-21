import React from 'react';

interface WaitlistManagerProps {
  waitlistedCourses: Array<{ course_id: string; title: string; position: number }>;
  onDrop: (course_id: string) => void;
}

const WaitlistManager: React.FC<WaitlistManagerProps> = ({ waitlistedCourses, onDrop }) => {
  return (
    <div className="waitlist-manager card p-3 mb-4">
      <h5 className="mb-3">Waitlisted Courses</h5>
      {waitlistedCourses.length === 0 ? (
        <div className="alert alert-info">You are not on any waitlists.</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Course</th>
              <th>Position</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {waitlistedCourses.map((item) => (
              <tr key={item.course_id}>
                <td>{item.title} ({item.course_id})</td>
                <td>{item.position}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => onDrop(item.course_id)}>
                    Drop
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WaitlistManager;