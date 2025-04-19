import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Chip,
} from '@mui/material';

interface TimelineEvent {
  semester: string;
  courses: {
    code: string;
    name: string;
    credits: number;
    status: 'completed' | 'in-progress' | 'planned';
  }[];
}

const timelineData: TimelineEvent[] = [
  {
    semester: 'Fall 2023',
    courses: [
      {
        code: 'CS101',
        name: 'Introduction to Computer Science',
        credits: 3,
        status: 'completed',
      },
      {
        code: 'MATH201',
        name: 'Calculus I',
        credits: 4,
        status: 'completed',
      },
    ],
  },
  {
    semester: 'Spring 2024',
    courses: [
      {
        code: 'CS102',
        name: 'Data Structures',
        credits: 3,
        status: 'in-progress',
      },
      {
        code: 'PHYS101',
        name: 'Physics I',
        credits: 4,
        status: 'in-progress',
      },
    ],
  },
  {
    semester: 'Fall 2024',
    courses: [
      {
        code: 'CS201',
        name: 'Algorithms',
        credits: 3,
        status: 'planned',
      },
      {
        code: 'CS202',
        name: 'Database Systems',
        credits: 3,
        status: 'planned',
      },
    ],
  },
];

const Timeline = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'planned':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Academic Timeline
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Stepper orientation="vertical">
          {timelineData.map((event, index) => (
            <Step key={event.semester} active={true}>
              <StepLabel>
                <Typography variant="h6">{event.semester}</Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  {event.courses.map((course) => (
                    <Card key={course.code} sx={{ mb: 1 }}>
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 1,
                          }}
                        >
                          <Typography variant="h6">
                            {course.code}
                          </Typography>
                          <Chip
                            label={course.status}
                            color={getStatusColor(course.status)}
                            size="small"
                          />
                        </Box>
                        <Typography color="text.secondary">
                          {course.name}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Credits: {course.credits}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Box>
  );
};

export default Timeline; 