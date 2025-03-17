<template>
  <div class="p-6 bg-white rounded shadow-md max-w-2xl mx-auto mt-6">
    <h2 class="text-xl font-bold mb-4">Create Academic Plan</h2>
    <form @submit.prevent="submitPlan">
      <div class="mb-4">
        <label for="studentId" class="block mb-1">Student ID</label>
        <input v-model="studentId" type="number" id="studentId" class="w-full border border-gray-300 p-2 rounded" required>
      </div>

      <div v-for="(semester, index) in semesters" :key="index" class="mb-4 border p-4 rounded">
        <label class="block mb-1">Semester {{ index + 1 }} Name</label>
        <input v-model="semester.name" type="text" class="w-full border border-gray-300 p-2 mb-2 rounded" required>

        <div v-for="(course, cIndex) in semester.courses" :key="cIndex" class="mb-2">
          <label>Course {{ cIndex + 1 }}</label>
          <input v-model="course.code" type="text" placeholder="Code" class="w-full border p-1 mb-1 rounded">
          <input v-model="course.title" type="text" placeholder="Title" class="w-full border p-1 mb-1 rounded">
          <input v-model="course.credits" type="number" placeholder="Credits" class="w-full border p-1 mb-1 rounded">
        </div>

        <button type="button" @click="addCourse(index)" class="mt-2 text-sm text-blue-600">+ Add Course</button>
      </div>

      <button type="button" @click="addSemester" class="text-sm text-blue-600 mb-4">+ Add Semester</button>
      <button type="submit" class="bg-blue-600 text-white p-2 rounded">Submit Plan</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'AcademicPlanForm',
  data() {
    return {
      studentId: '',
      semesters: [{ name: '', courses: [{ code: '', title: '', credits: '' }] }]
    };
  },
  methods: {
    addSemester() {
      this.semesters.push({ name: '', courses: [{ code: '', title: '', credits: '' }] });
    },
    addCourse(index) {
      this.semesters[index].courses.push({ code: '', title: '', credits: '' });
    },
    submitPlan() {
      console.log({
        studentId: this.studentId,
        semesters: this.semesters
      });
    }
  }
};
</script>
