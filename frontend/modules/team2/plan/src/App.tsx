import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CoursePlanning from './pages/CoursePlanning';
import DegreeRequirements from './pages/DegreeRequirements';
import GraduationPath from './pages/GraduationPath';
import Timeline from './pages/Timeline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/course-planning" element={<CoursePlanning />} />
            <Route path="/degree-requirements" element={<DegreeRequirements />} />
            <Route path="/graduation-path" element={<GraduationPath />} />
            <Route path="/timeline" element={<Timeline />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
