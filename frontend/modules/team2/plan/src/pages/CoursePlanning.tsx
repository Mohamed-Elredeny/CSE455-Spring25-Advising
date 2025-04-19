import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Menu,
  ListItemIcon,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator as DragIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: string;
  color?: string;
  notes?: string;
}

const CoursePlanning = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    semester: 'Fall 2024',
  });
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const semesters = [
    'Fall 2024',
    'Spring 2025',
    'Fall 2025',
    'Spring 2026',
  ];

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(courses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    reorderedItem.semester = result.destination.droppableId;
    items.splice(result.destination.index, 0, reorderedItem);

    setCourses(items);
  };

  const handleAddOrUpdateCourse = () => {
    if (newCourse.code && newCourse.name && newCourse.credits && newCourse.semester) {
      if (editingCourse) {
        setCourses(courses.map(course => 
          course.id === editingCourse.id 
            ? { ...course, ...newCourse as Course }
            : course
        ));
      } else {
        setCourses([
          ...courses,
          {
            id: Math.random().toString(36).substr(2, 9),
            code: newCourse.code,
            name: newCourse.name,
            credits: newCourse.credits,
            semester: newCourse.semester,
            notes: newCourse.notes || '',
            color: newCourse.color || '#ffffff',
          } as Course,
        ]);
      }
      setOpenDialog(false);
      setNewCourse({ semester: 'Fall 2024' });
      setEditingCourse(null);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setNewCourse(course);
    setOpenDialog(true);
    setMenuAnchor(null);
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(courses.filter(course => course.id !== courseId));
    setMenuAnchor(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, course: Course) => {
    setMenuAnchor(event.currentTarget);
    setSelectedCourse(course);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Course Planning</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingCourse(null);
            setNewCourse({ semester: 'Fall 2024' });
            setOpenDialog(true);
          }}
        >
          Add Course
        </Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={3}>
          {semesters.map((semester) => (
            <Grid item xs={12} md={6} key={semester}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {semester}
                </Typography>
                <Droppable droppableId={semester}>
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{ minHeight: 100 }}
                    >
                      {courses
                        .filter((course) => course.semester === semester)
                        .map((course, index) => (
                          <Draggable
                            key={course.id}
                            draggableId={course.id}
                            index={index}
                          >
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                sx={{
                                  mb: 1,
                                  backgroundColor: course.color,
                                }}
                              >
                                <CardContent>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box {...provided.dragHandleProps}>
                                      <DragIcon />
                                    </Box>
                                    <Box sx={{ flexGrow: 1, ml: 1 }}>
                                      <Typography variant="h6">{course.code}</Typography>
                                      <Typography color="text.secondary">
                                        {course.name}
                                      </Typography>
                                      <Typography variant="body2">
                                        Credits: {course.credits}
                                      </Typography>
                                      {course.notes && (
                                        <Typography variant="body2" color="text.secondary">
                                          Notes: {course.notes}
                                        </Typography>
                                      )}
                                    </Box>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => handleMenuOpen(e, course)}
                                    >
                                      <MoreVertIcon />
                                    </IconButton>
                                  </Box>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DragDropContext>

      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingCourse(null);
          setNewCourse({ semester: 'Fall 2024' });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCourse ? 'Edit Course' : 'Add New Course'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Course Code"
            fullWidth
            value={newCourse.code || ''}
            onChange={(e) =>
              setNewCourse({ ...newCourse, code: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Course Name"
            fullWidth
            value={newCourse.name || ''}
            onChange={(e) =>
              setNewCourse({ ...newCourse, name: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Credits"
            type="number"
            fullWidth
            value={newCourse.credits || ''}
            onChange={(e) =>
              setNewCourse({
                ...newCourse,
                credits: parseInt(e.target.value, 10),
              })
            }
          />
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Semester</InputLabel>
            <Select
              value={newCourse.semester}
              label="Semester"
              onChange={(e) =>
                setNewCourse({ ...newCourse, semester: e.target.value })
              }
            >
              {semesters.map((semester) => (
                <MenuItem key={semester} value={semester}>
                  {semester}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Notes"
            fullWidth
            multiline
            rows={2}
            value={newCourse.notes || ''}
            onChange={(e) =>
              setNewCourse({ ...newCourse, notes: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Color"
            type="color"
            fullWidth
            value={newCourse.color || '#ffffff'}
            onChange={(e) =>
              setNewCourse({ ...newCourse, color: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            setEditingCourse(null);
            setNewCourse({ semester: 'Fall 2024' });
          }}>
            Cancel
          </Button>
          <Button onClick={handleAddOrUpdateCourse} variant="contained">
            {editingCourse ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => selectedCourse && handleEditCourse(selectedCourse)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => selectedCourse && handleDeleteCourse(selectedCourse.id)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CoursePlanning; 