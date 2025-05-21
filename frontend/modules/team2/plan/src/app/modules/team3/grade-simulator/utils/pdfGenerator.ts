import jsPDF from 'jspdf';
import { getStudent } from '../Api/index';

interface SimulationResult {
  course_id: string;
  course_name: string;
  credits: number;
  new_grade: string;
  grade_points: number;
  is_new_course: boolean;
  semester_number?: number;
}

interface StudentDetails {
  id: string;
  name: string;
  program_id: string;
}

interface PdfGeneratorProps {
  studentId: string;
  currentCgpa: number | null;
  simulatedCgpa: number | null;
  simulationResults: SimulationResult[];
  onGeneratingChange?: (isGenerating: boolean) => void;
}

export const generateSimulationPdf = async ({
  studentId,
  currentCgpa,
  simulatedCgpa,
  simulationResults,
  onGeneratingChange
}: PdfGeneratorProps): Promise<void> => {
  if (!simulationResults.length) {
    throw new Error('No simulation results available');
  }

  try {
    onGeneratingChange?.(true);
    
    // Fetch student details
    const studentResponse = await getStudent(studentId);
    
    if (!studentResponse?.data) {
      throw new Error('Failed to fetch student details');
    }

    const studentDetails = studentResponse.data as StudentDetails;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(44, 119, 244); // Primary blue color
    doc.text('Grade Simulation Results', 20, 20);
    
    // Add Student Information
    doc.setFontSize(14);
    doc.setTextColor(108, 117, 125); // Gray text color
    
    // Student Name
    doc.text(`Student Name: ${studentDetails.name || 'N/A'}`, 20, 35);
    
    // Student ID
    doc.text(`Student ID: ${studentDetails.id || studentId}`, 20, 45);
    
    // Program
    doc.text(`Program: ${studentDetails.program_id || 'N/A'}`, 20, 55);
    
    // Current CGPA
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`Current CGPA: ${typeof currentCgpa === 'number' ? currentCgpa.toFixed(2) : 'N/A'}`, 20, 70);
    
    // Simulated CGPA
    doc.text(`Simulated CGPA: ${typeof simulatedCgpa === 'number' ? simulatedCgpa.toFixed(2) : 'N/A'}`, 20, 85);

    let yPosition = 100;
    
    // Group results by semester
    const resultsBySemester = simulationResults.reduce((acc, result) => {
      const semesterNumber = result.semester_number || 1;
      if (!acc[semesterNumber]) {
        acc[semesterNumber] = [];
      }
      acc[semesterNumber].push(result);
      return acc;
    }, {} as Record<number, SimulationResult[]>);

    // Sort semester numbers
    const semesterNumbers = Object.keys(resultsBySemester).map(Number).sort((a, b) => a - b);
    
    // Add results by semester
    semesterNumbers.forEach((semesterNumber) => {
      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      // Add semester header
      doc.setFontSize(14);
      doc.setTextColor(33, 37, 41); // Dark text color
      doc.text(`Semester ${semesterNumber}`, 20, yPosition);
      yPosition += 10;

      // Add table headers
      doc.setFontSize(12);
      doc.setTextColor(108, 117, 125); // Gray text color
      doc.text('Course', 20, yPosition);
      doc.text('Grade', 120, yPosition);
      doc.text('Points', 150, yPosition);
      doc.text('Status', 180, yPosition);
      yPosition += 5;

      // Add horizontal line
      doc.setDrawColor(233, 236, 239); // Light gray color
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;

      // Add courses
      doc.setTextColor(0, 0, 0);
      resultsBySemester[semesterNumber].forEach((result) => {
        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        doc.text(result.course_name, 20, yPosition);
        doc.text(result.new_grade, 120, yPosition);
        doc.text(result.grade_points.toFixed(2), 150, yPosition);
        doc.text(result.is_new_course ? 'New Course' : 'Retake', 180, yPosition);
        yPosition += 10;
      });

      yPosition += 10;
    });

    // Add generation date at the bottom
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.setTextColor(108, 117, 125);
    doc.text(`Generated on: ${currentDate}`, 20, 280);

    // Save the PDF
    doc.save(`grade-simulation-results-${studentId}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate PDF: ${error.message}`);
    } else {
      throw new Error('Failed to generate PDF. Please try again.');
    }
  } finally {
    onGeneratingChange?.(false);
  }
}; 