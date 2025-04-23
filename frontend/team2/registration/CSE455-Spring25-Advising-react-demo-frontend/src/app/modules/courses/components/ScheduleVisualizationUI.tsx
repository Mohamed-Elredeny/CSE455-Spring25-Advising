import React from 'react';

interface Section {
  id: number;
  section_id: string;
  instructor: string;
  schedule_day: string;
  schedule_time: string;
  capacity: number;
  course_id: string;
}

interface ScheduleVisualizationUIProps {
  sections: Section[];
}

const ScheduleVisualizationUI: React.FC<ScheduleVisualizationUIProps> = ({ sections }) => {
  // Group sections by day
  const groupedSections = sections.reduce<Record<string, Section[]>>((acc, section) => {
    if (!acc[section.schedule_day]) {
      acc[section.schedule_day] = [];
    }
    acc[section.schedule_day].push(section);
    return acc;
  }, {});

  return (
    <div className="schedule-visualization-ui">
      <h2>Schedule Visualization</h2>
      {Object.keys(groupedSections).length === 0 ? (
        <p>No sections available.</p>
      ) : (
        Object.entries(groupedSections).map(([day, daySections]) => (
          <div key={day} style={{ marginBottom: '15px' }}>
            <h3>{day}</h3>
            <ul>
              {daySections.map(section => (
                <li key={section.id}>
                  <p><strong>Section:</strong> {section.section_id}</p>
                  <p><strong>Instructor:</strong> {section.instructor}</p>
                  <p><strong>Time:</strong> {section.schedule_time}</p>
                  <p><strong>Capacity:</strong> {section.capacity}</p>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default ScheduleVisualizationUI;
