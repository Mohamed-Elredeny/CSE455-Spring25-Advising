import React, { useState, useEffect } from 'react';
import { calculateCGPA, getGpaRules } from '../Api';
import { KTIcon } from '../../../../../_metronic/helpers';

interface GpaRule {
  letter_grade: string;
  gpa_points: number;
  min_percentage: number;
  max_percentage: number;
}

interface GpaCalculatorProps {
  studentId: string;
}

const GpaCalculator: React.FC<GpaCalculatorProps> = ({ studentId }) => {
  const [currentCgpa, setCurrentCgpa] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gpaRules, setGpaRules] = useState<GpaRule[]>([]);

  useEffect(() => {
    const fetchGpaRules = async () => {
      try {
        const response = await getGpaRules();
        setGpaRules(response.data);
      } catch (error) {
        console.error('Error fetching GPA rules:', error);
        setError('Failed to load GPA rules');
      }
    };
    fetchGpaRules();
  }, []);

  useEffect(() => {
    const fetchCgpa = async () => {
      if (!studentId) return;
      
      try {
        setLoading(true);
        const response = await calculateCGPA(studentId);
        setCurrentCgpa(response.data.cgpa);
        setError('');
      } catch (error) {
        console.error('Error calculating CGPA:', error);
        setError('Failed to calculate CGPA - Please check Student ID');
        setCurrentCgpa(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCgpa();
  }, [studentId]);

  return (
    <div className='card'>
      <div className='card-header border-0 pt-5'>
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bold fs-3 mb-1'>GPA Calculator</span>
          <span className='text-muted mt-1 fw-semibold fs-7'>Calculate student GPA</span>
        </h3>
      </div>
      
      <div className='card-body pt-0'>
        {error && (
          <div className='alert alert-danger d-flex align-items-center p-5 mb-10'>
            <KTIcon iconName='cross-circle' className='fs-2hx text-danger me-3' />
            <div className='d-flex flex-column'>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className='row g-5'>
          <div className='col-md-12'>
            <div className='card card-flush'>
              <div className='card-header'>
                <h3 className='card-title fw-bold text-gray-800'>Current CGPA Calculator</h3>
              </div>
              <div className='card-body pt-1'>
                {currentCgpa && (
                  <div className='alert alert-success mt-5'>
                    <div className='d-flex align-items-center'>
                      <KTIcon iconName='tick-circle' className='fs-2hx text-success me-3' />
                      <span className='fw-bold'>Current CGPA: {currentCgpa}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='mt-10 text-center text-muted'>
          <KTIcon iconName='shield-tick' className='fs-2' />
          <div className='fw-semibold fs-7'>Calculations based on official GPA rules</div>
        </div>
      </div>
    </div>
  );
};

export default GpaCalculator;