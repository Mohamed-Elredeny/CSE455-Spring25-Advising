import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Divider,
  Grid,
  Collapse,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  ExpandLess,
  ExpandMore,
  Info as InfoIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

interface Course {
  code: string;
  name: string;
  credits: number;
  completed: boolean;
  grade?: string;
  term?: string;
}

interface Requirement {
  id: string;
  name: string;
  description: string;
  credits: number;
  completed: number;
  courses: Course[];
  minimumGPA?: number;
  notes?: string;
}

const DegreeRequirements = () => {
  const [requirements, setRequirements] = useState<Requirement[]>([
    {
      id: '1',
      name: 'Core Courses',
      description: 'Fundamental courses required for all students',
      credits: 30,
      completed: 18,
      minimumGPA: 2.5,
      courses: [
        { code: 'CS101', name: 'Introduction to Programming', credits: 3, completed: true, grade: 'A' },
        { code: 'CS102', name: 'Data Structures', credits: 3, completed: true, grade: 'B+' },
        { code: 'MATH201', name: 'Calculus I', credits: 4, completed: true, grade: 'A-' },
        { code: 'PHYS101', name: 'Physics I', credits: 4, completed: false },
        { code: 'ENG101', name: 'English Composition', credits: 3, completed: true, grade: 'B' },
      ],
    },
    {
      id: '2',
      name: 'Major Requirements',
      description: 'Specialized courses in your field of study',
      credits: 45,
      completed: 24,
      minimumGPA: 3.0,
      courses: [
        { code: 'CS201', name: 'Algorithms', credits: 3, completed: true, grade: 'A-' },
        { code: 'CS202', name: 'Database Systems', credits: 3, completed: true, grade: 'B+' },
        { code: 'CS301', name: 'Software Engineering', credits: 3, completed: false },
        { code: 'CS302', name: 'Operating Systems', credits: 3, completed: false },
        { code: 'CS401', name: 'Computer Networks', credits: 3, completed: false },
      ],
    },
    {
      id: '3',
      name: 'Electives',
      description: 'Optional courses to complete your degree',
      credits: 15,
      completed: 6,
      courses: [
        { code: 'ART101', name: 'Introduction to Art', credits: 3, completed: true, grade: 'A' },
        { code: 'HIST101', name: 'World History', credits: 3, completed: true, grade: 'B' },
      ],
    },
  ]);

  const [expandedRequirement, setExpandedRequirement] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);

  const totalCredits = requirements.reduce((sum, req) => sum + req.credits, 0);
  const completedCredits = requirements.reduce((sum, req) => sum + req.completed, 0);
  const overallProgress = (completedCredits / totalCredits) * 100;

  const handleRequirementClick = (requirementId: string) => {
    setExpandedRequirement(expandedRequirement === requirementId ? null : requirementId);
  };

  const calculateGPA = (courses: Course[]) => {
    const completedCourses = courses.filter(course => course.completed && course.grade);
    if (completedCourses.length === 0) return 0;

    const gradePoints = {
      'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0,
    };

    const totalPoints = completedCourses.reduce((sum, course) => {
      return sum + (gradePoints[course.grade as keyof typeof gradePoints] * course.credits);
    }, 0);

    const totalCredits = completedCourses.reduce((sum, course) => sum + course.credits, 0);
    return totalPoints / totalCredits;
  };

  const handleEditCourse = (course: Course, requirement: Requirement) => {
    setSelectedCourse(course);
    setSelectedRequirement(requirement);
    setEditDialogOpen(true);
  };

  const handleUpdateCourse = (updatedCourse: Course) => {
    if (!selectedRequirement) return;

    const updatedRequirements = requirements.map(req => {
      if (req.id === selectedRequirement.id) {
        const updatedCourses = req.courses.map(course => 
          course.code === updatedCourse.code ? updatedCourse : course
        );
        const completed = updatedCourses.reduce((sum, course) => 
          sum + (course.completed ? course.credits : 0), 0
        );
        return { ...req, courses: updatedCourses, completed };
      }
      return req;
    });

    setRequirements(updatedRequirements);
    setEditDialogOpen(false);
    setSelectedCourse(null);
    setSelectedRequirement(null);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Degree Requirements
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Overall Progress
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ flexGrow: 1, mr: 2 }}>
            <LinearProgress
              variant="determinate"
              value={overallProgress}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {Math.round(overallProgress)}%
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {completedCredits} of {totalCredits} credits completed
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {requirements.map((requirement) => (
          <Grid item xs={12} key={requirement.id}>
            <Paper sx={{ p: 2 }}>
              <ListItemButton onClick={() => handleRequirementClick(requirement.id)}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h6" component="span">
                        {requirement.name}
                      </Typography>
                      {requirement.minimumGPA && (
                        <Tooltip title={`Minimum GPA required: ${requirement.minimumGPA}`}>
                          <InfoIcon sx={{ ml: 1, fontSize: 20, color: 'action.active' }} />
                        </Tooltip>
                      )}
                    </Box>
                  }
                  secondary={requirement.description}
                />
                {expandedRequirement === requirement.id ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              
              <Box sx={{ display: 'flex', alignItems: 'center', px: 2, mb: 2 }}>
                <Box sx={{ flexGrow: 1, mr: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(requirement.completed / requirement.credits) * 100}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {requirement.completed}/{requirement.credits} credits
                </Typography>
              </Box>

              <Collapse in={expandedRequirement === requirement.id}>
                <Divider sx={{ my: 2 }} />

                {requirement.minimumGPA && (
                  <Alert 
                    severity={calculateGPA(requirement.courses) >= requirement.minimumGPA ? "success" : "warning"}
                    sx={{ mb: 2 }}
                  >
                    Current GPA: {calculateGPA(requirement.courses).toFixed(2)} 
                    (Minimum Required: {requirement.minimumGPA})
                  </Alert>
                )}

                <List dense>
                  {requirement.courses.map((course) => (
                    <ListItem
                      key={course.code}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          onClick={() => handleEditCourse(course, requirement)}
                        >
                          <EditIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        {course.completed ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <UncheckedIcon />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={`${course.code} - ${course.name}`}
                        secondary={
                          <React.Fragment>
                            {`${course.credits} credits`}
                            {course.grade && ` • Grade: ${course.grade}`}
                            {course.term && ` • ${course.term}`}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Update Course Status</DialogTitle>
        <DialogContent>
          {selectedCourse && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6">{selectedCourse.code}</Typography>
              <Typography color="text.secondary" gutterBottom>
                {selectedCourse.name}
              </Typography>
              <TextField
                select
                fullWidth
                label="Status"
                value={selectedCourse.completed}
                onChange={(e) => setSelectedCourse({
                  ...selectedCourse,
                  completed: e.target.value === 'true',
                })}
                sx={{ mb: 2 }}
              >
                <MenuItem value="true">Completed</MenuItem>
                <MenuItem value="false">Not Completed</MenuItem>
              </TextField>
              {selectedCourse.completed && (
                <TextField
                  select
                  fullWidth
                  label="Grade"
                  value={selectedCourse.grade || ''}
                  onChange={(e) => setSelectedCourse({
                    ...selectedCourse,
                    grade: e.target.value,
                  })}
                  sx={{ mb: 2 }}
                >
                  {['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'].map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              <TextField
                fullWidth
                label="Term"
                value={selectedCourse.term || ''}
                onChange={(e) => setSelectedCourse({
                  ...selectedCourse,
                  term: e.target.value,
                })}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => selectedCourse && handleUpdateCourse(selectedCourse)}
            variant="contained"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DegreeRequirements; 