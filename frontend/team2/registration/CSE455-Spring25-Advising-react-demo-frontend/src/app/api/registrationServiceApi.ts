const API_BASE_URL = '/api/registrations';

export async function registerCourse(studentId: string, courseId: string, semester: string) {
  const response = await fetch(API_BASE_URL + '/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student_id: studentId, course_id: courseId, semester }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }
  return response.json();
}

export async function getWaitlistPosition(studentId: string, courseId: string) {
  const response = await fetch('/api/waitlist/position?student_id=' + studentId + '&course_id=' + courseId);
  if (!response.ok) {
    throw new Error('Failed to fetch waitlist position');
  }
  return response.json();
}
