import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface Course {
  code: string;
  name: string;
  prerequisites: string[];
  status: 'completed' | 'available' | 'locked';
  semester: string;
}

const courses: Course[] = [
  {
    code: 'CS101',
    name: 'Introduction to Programming',
    prerequisites: [],
    status: 'completed',
    semester: 'Fall 2023',
  },
  {
    code: 'CS102',
    name: 'Data Structures',
    prerequisites: ['CS101'],
    status: 'completed',
    semester: 'Spring 2024',
  },
  {
    code: 'CS201',
    name: 'Algorithms',
    prerequisites: ['CS102'],
    status: 'available',
    semester: 'Fall 2024',
  },
  {
    code: 'CS301',
    name: 'Database Systems',
    prerequisites: ['CS201'],
    status: 'locked',
    semester: 'Spring 2025',
  },
  {
    code: 'CS401',
    name: 'Software Engineering',
    prerequisites: ['CS201', 'CS301'],
    status: 'locked',
    semester: 'Fall 2025',
  },
];

const GraduationPath = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'available':
        return 'primary';
      case 'locked':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'available':
        return <ArrowForwardIcon color="primary" />;
      case 'locked':
        return <WarningIcon color="disabled" />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Graduation Path
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Track your progress and plan your path to graduation. Courses are unlocked as you complete their prerequisites.
      </Typography>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} key={course.code}>
            <Paper
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                '&:hover': {
                  boxShadow: 2,
                },
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(course.status)}
                    <Typography variant="h6">{course.code}</Typography>
                  </Box>
                  <Typography color="text.secondary">{course.name}</Typography>
                  <Chip
                    label={course.status}
                    color={getStatusColor(course.status)}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Prerequisites
                  </Typography>
                  {course.prerequisites.length > 0 ? (
                    <List dense>
                      {course.prerequisites.map((prereq) => (
                        <ListItem key={prereq}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <ArrowForwardIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={prereq} />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No prerequisites
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Planned For
                  </Typography>
                  <Typography variant="body2">{course.semester}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default GraduationPath; 