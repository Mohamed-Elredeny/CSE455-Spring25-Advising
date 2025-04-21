import React, { useState, useEffect } from 'react';
import { KTCard, KTCardBody } from '../../../../_metronic/helpers';
import { getAllCourses, getSchedule, getWaitlist, dropFromWaitlist, resolveConflict, ignoreConflict } from '../core/_requests';
import { Course } from '../core/_models';
import Timetable from './Timetable';
import ConfirmationModal from './ConfirmationModal';
import WaitlistManager from './WaitlistManager';
import ConflictResolution from './ConflictResolution';

const CourseRegistration: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  interface ScheduleItem {
  course_id: string;
  title: string;
  day: string;
  time: string;
  location: string;
}

interface WaitlistItem {
  course_id: string;
  title: string;
  position: number;
}

interface ConflictItem {
  course_id: string;
  title: string;
  reason: string;
}

const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
const [waitlistedCourses, setWaitlistedCourses] = useState<WaitlistItem[]>([]);
const [conflicts, setConflicts] = useState<ConflictItem[]>([]);

  useEffect(() => {
    loadCourses();
    loadSchedule();
    loadWaitlist();
    loadConflicts();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const response = await getAllCourses();
      setCourses(response.data);
    } catch (err) {
      setError('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  const loadSchedule = async () => {
    try {
      const response = await getSchedule();
      setSchedule(response.data);
    } catch (err) {
      setError('Failed to load schedule.');
    }
  };

  const loadWaitlist = async () => {
    try {
      const response = await getWaitlist();
      setWaitlistedCourses(response.data);
    } catch (err) {
      setError('Failed to load waitlist.');
    }
  };

  const loadConflicts = async () => {
    try {
      const response = await getSchedule(); // Assuming conflicts come from schedule endpoint
      setConflicts(response.data.filter((item: any) => 'conflict' in item));
    } catch (err) {
      setError('Failed to load conflicts.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const confirmRegister = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    setShowConfirm(false);
    try {
      await registerForCourse(selectedCourse);
      setSuccess('Registration successful!');
      loadSchedule();
      loadWaitlist();
      loadConflicts();
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDropWaitlist = async (course_id: string) => {
    try {
      await dropFromWaitlist(course_id);
      setWaitlistedCourses(prev => prev.filter(c => c.course_id !== course_id));
    } catch (err) {
      setError('Failed to drop from waitlist.');
    }
  };

  const handleResolveConflict = async (course_id: string) => {
    try {
      await resolveConflict(course_id);
      setConflicts(prev => prev.filter(c => c.course_id !== course_id));
    } catch (err) {
      setError('Failed to resolve conflict.');
    }
  };

  const handleIgnoreConflict = async (course_id: string) => {
    try {
      await ignoreConflict(course_id);
      setConflicts(prev => prev.filter(c => c.course_id !== course_id));
    } catch (err) {
      setError('Failed to ignore conflict.');
    }
  };

  return (
    <KTCard className="mb-8">
      <KTCardBody>
        <h2 className="mb-6 text-primary d-flex align-items-center">
          <span className="me-2"><i className="bi bi-journal-check"></i></span>
          Course Registration
        </h2>
        <section className="mb-5">
          <form onSubmit={handleRegister} className="row g-3 align-items-end">
            <div className="col-md-8">
              <label htmlFor="courseSelect" className="form-label fw-bold">
                <i className="bi bi-book me-2"></i>Select Course
              </label>
              <select
                id="courseSelect"
                className="form-select form-select-solid"
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                required
              >
                <option value="" disabled>Select a course...</option>
                {courses.map(course => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.title} ({course.course_id})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <button
                type="submit"
                className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                disabled={loading || !selectedCourse}
              >
                <i className="bi bi-plus-circle me-2"></i>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        </section>
        <section className="mb-5">
          <Timetable schedule={schedule} />
        </section>
        <section className="mb-5">
          <WaitlistManager waitlistedCourses={waitlistedCourses} onDrop={handleDropWaitlist} />
        </section>
        <section className="mb-5">
          <ConflictResolution conflicts={conflicts} onResolve={handleResolveConflict} onIgnore={handleIgnoreConflict} />
        </section>
        {success && <div className="alert alert-success mt-5"><i className="bi bi-check-circle me-2"></i>{success}</div>}
        {error && <div className="alert alert-danger mt-5"><i className="bi bi-exclamation-triangle me-2"></i>{error}</div>}
        <ConfirmationModal
          show={showConfirm}
          title="Confirm Registration"
          message={
            selectedCourse
              ? `Are you sure you want to register for course ${selectedCourse}?`
              : ''
          }
          onConfirm={confirmRegister}
          onCancel={() => setShowConfirm(false)}
        />
      </KTCardBody>
    </KTCard>
  );
};

export default CourseRegistration;