const API_BASE_URL = '/api/courses';

export async function fetchCourseCatalog() {
  const response = await fetch(\`\${API_BASE_URL}/catalog\`);
  if (!response.ok) {
    throw new Error('Failed to fetch course catalog');
  }
  return response.json();
}

export async function fetchCourseById(courseId: string) {
  const response = await fetch(\`\${API_BASE_URL}/catalog/\${courseId}\`);
  if (!response.ok) {
    throw new Error('Failed to fetch course details');
  }
  return response.json();
}
