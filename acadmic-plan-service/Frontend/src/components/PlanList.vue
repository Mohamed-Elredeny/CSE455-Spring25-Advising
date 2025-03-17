<template>
  <div class="p-6 bg-white rounded shadow-md max-w-3xl mx-auto mt-6">
    <h2 class="text-xl font-bold mb-4">Academic Plans</h2>
    <ul>
      <li v-for="plan in plans" :key="plan.id" class="mb-2 border p-2 rounded">
        <h3 class="font-bold">Plan ID: {{ plan.id }} (Student: {{ plan.studentId }})</h3>
        <ul>
          <li v-for="semester in plan.semesters" :key="semester.id" class="ml-4 mb-2">
            <strong>{{ semester.name }}</strong>
            <ul>
              <li v-for="course in semester.courses" :key="course.id">
                {{ course.code }} - {{ course.title }} ({{ course.credits }} credits)
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'PlanList',
  data() {
    return {
      plans: [],
    };
  },
  mounted() {
    // Here you will make an API call to fetch plans
    // Example:
    // this.plans = await fetch('/api/plans').then(res => res.json());
  }
};
</script>
