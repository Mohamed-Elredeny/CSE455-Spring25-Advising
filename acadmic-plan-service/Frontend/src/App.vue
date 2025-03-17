<template>
  <div id="app" class="min-h-screen bg-gray-100 text-gray-800">
    <nav class="bg-blue-600 text-white p-4 flex justify-between">
      <div class="text-xl font-bold">University Advising System</div>
      <div class="space-x-4">
        <router-link to="/" class="hover:text-blue-200">Home</router-link>
        <router-link to="/create" class="hover:text-blue-200">Create Plan</router-link>
        <router-link to="/plans" class="hover:text-blue-200">View Plans</router-link>
      </div>
    </nav>
    <main class="container mx-auto p-4">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>
