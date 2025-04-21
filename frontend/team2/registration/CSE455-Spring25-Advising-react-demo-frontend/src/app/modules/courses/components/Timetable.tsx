import React from 'react';

interface TimetableProps {
  schedule: Array<{ day: string; start: string; end: string; course: string }>;
}

const Timetable: React.FC<TimetableProps> = ({ schedule }) => {
  return (
    <div className="timetable card p-3 mb-4">
      <h5 className="mb-3">Your Weekly Schedule</h5>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Day</th>
            <th>Start</th>
            <th>End</th>
            <th>Course</th>
          </tr>
        </thead>
        <tbody>
          {schedule.length === 0 ? (
            <tr><td colSpan={4} className="text-center">No courses scheduled.</td></tr>
          ) : (
            schedule.map((item, idx) => (
              <tr key={idx}>
                <td>{item.day}</td>
                <td>{item.start}</td>
                <td>{item.end}</td>
                <td>{item.course}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Timetable;