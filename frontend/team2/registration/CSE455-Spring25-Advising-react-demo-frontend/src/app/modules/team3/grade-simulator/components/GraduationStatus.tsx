import React, { useState, useEffect } from 'react';
import { checkGraduationStatus } from '../Api';
import { KTIcon } from '../../../../../_metronic/helpers';

interface GraduationStatusProps {
  studentId: string;
}

interface GraduationStatusData {
  student_id: string;
  current_gpa: string;
  total_credits_earned: number;
  min_gpa_required: number;
  min_credits_required: number;
  meets_gpa: boolean;
  meets_credits: boolean;
  can_graduate: boolean;
}

const GraduationStatus: React.FC<GraduationStatusProps> = ({ studentId }) => {
  const [status, setStatus] = useState<GraduationStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (studentId) {
      handleCheckStatus();
    }
  }, [studentId]);

  const handleCheckStatus = async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const response = await checkGraduationStatus(studentId);
      setStatus(response.data);
      setError('');
    } catch (err: any) {
      console.error('Error checking graduation status:', err);
      setError(err.response?.data?.message || 'Failed to check graduation status');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='card'>
      <div className='card-header border-0 pt-5'>
        <h3 className='card-title align-items-start flex-column'>
          <KTIcon iconName='shield-tick' className='fs-2hx text-primary me-3' />
          <span className='card-label fw-bold fs-3 mb-1'>Graduation Status Check</span>
          <span className='text-muted mt-1 fw-semibold fs-7'>Verify student graduation eligibility</span>
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
          {!studentId && (
            <div className='col-12'>
              <div className='card card-flush'>
                <div className='card-body'>
                  <div className='text-center py-4'>
                    <p className='text-muted'>Enter a student ID to view graduation status</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className='col-12'>
              <div className='card card-flush'>
                <div className='card-body'>
                  <div className='text-center py-4'>
                    <div className='spinner-border text-primary' role='status'>
                      <span className='visually-hidden'>Loading...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status && (
            <div className='col-12'>
              <div className='card card-flush bg-light'>
                <div className='card-header'>
                  <h3 className='card-title fw-bold text-gray-800'>Eligibility Report</h3>
                </div>
                <div className='card-body pt-1'>
                  <div className='row g-5 mb-5'>
                    <div className='col-md-6'>
                      <div className='d-flex align-items-center'>
                        <KTIcon iconName='abstract-11' className='fs-2hx text-primary me-3' />
                        <div>
                          <div className='fs-5 fw-semibold'>Student ID</div>
                          <div className='fs-3 fw-bold'>{status.student_id}</div>
                        </div>
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div className='d-flex align-items-center'>
                        <KTIcon iconName='chart-simple' className='fs-2hx text-primary me-3' />
                        <div>
                          <div className='fs-5 fw-semibold'>Current GPA</div>
                          <div className='fs-3 fw-bold'>{status.current_gpa}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='separator separator-dashed my-5'></div>

                  <div className='row g-5'>
                    <div className='col-md-6'>
                      <div className='d-flex flex-column'>
                        <div className='fs-6 text-muted mb-2'>Credits Earned</div>
                        <div className='d-flex align-items-center'>
                          <span className={`fs-2x fw-bold ${status.meets_credits ? 'text-success' : 'text-danger'}`}>
                            {status.total_credits_earned}
                          </span>
                          <span className='ms-2'>/ {status.min_credits_required}</span>
                        </div>
                        <div className={`badge badge-light-${status.meets_credits ? 'success' : 'danger'} fs-7 mt-2`}>
                          {status.meets_credits ? 'Requirement Met' : 'Requirement Not Met'}
                        </div>
                      </div>
                    </div>
                    
                    <div className='col-md-6'>
                      <div className='d-flex flex-column'>
                        <div className='fs-6 text-muted mb-2'>GPA Status</div>
                        <div className='d-flex align-items-center'>
                          <span className={`fs-2x fw-bold ${status.meets_gpa ? 'text-success' : 'text-danger'}`}>
                            {status.current_gpa}
                          </span>
                          <span className='ms-2'>/ {status.min_gpa_required}</span>
                        </div>
                        <div className={`badge badge-light-${status.meets_gpa ? 'success' : 'danger'} fs-7 mt-2`}>
                          {status.meets_gpa ? 'Requirement Met' : 'Requirement Not Met'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='separator separator-dashed my-5'></div>

                  <div className={`alert alert-${status.can_graduate ? 'success' : 'danger'} d-flex align-items-center p-5`}>
                    <KTIcon 
                      iconName={status.can_graduate ? 'check-circle' : 'cross-circle'} 
                      className={`fs-2hx text-${status.can_graduate ? 'success' : 'danger'} me-3`} 
                    />
                    <div className='d-flex flex-column'>
                      <span className='fw-bold fs-3'>
                        {status.can_graduate ? 'Eligible for Graduation' : 'Not Eligible for Graduation'}
                      </span>
                      <span className='fs-6'>
                        {status.can_graduate 
                          ? 'Student meets all graduation requirements'
                          : 'Student does not meet all graduation requirements'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraduationStatus;