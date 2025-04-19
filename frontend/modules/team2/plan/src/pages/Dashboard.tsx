import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
} from '@mui/material';
import {
  Book as BookIcon,
  School as SchoolIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Course Planning',
      description: 'Plan your courses for upcoming semesters',
      icon: <BookIcon sx={{ fontSize: 40 }} />,
      path: '/course-planning',
    },
    {
      title: 'Degree Requirements',
      description: 'Track your progress towards graduation',
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      path: '/degree-requirements',
    },
    {
      title: 'Graduation Path',
      description: 'View your path to graduation',
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      path: '/graduation-path',
    },
    {
      title: 'Timeline',
      description: 'Visualize your academic journey',
      icon: <TimelineIcon sx={{ fontSize: 40 }} />,
      path: '/timeline',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome to Academic Planner
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Your comprehensive tool for academic planning and degree tracking
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={3} key={feature.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                    color: 'primary.main',
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  {feature.title}
                </Typography>
                <Typography align="center" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  fullWidth
                  onClick={() => navigate(feature.path)}
                >
                  Access
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard; 