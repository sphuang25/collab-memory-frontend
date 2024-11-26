<script setup lang="ts">
import { useUserStore } from "@/stores/user"; // Import user store
import { storeToRefs } from "pinia";
import CreateProfile from "@/components/Profiling/ProfilingComponent.vue"; // Import CreateProfile component
import { onMounted } from "vue";

const userStore = useUserStore();
const { isLoggedIn, isProfileComplete } = storeToRefs(userStore);

onMounted(() => {
  if (!isLoggedIn.value) {
    userStore.fetchUserSession(); // Fetch session info on mount
  }
});
</script>

<template>
  <main>
    <!-- Welcome Section for Users Not Logged In -->
    <section v-if="!isLoggedIn" class="welcome-section">
      <div class="overlay">
        <h1>Welcome to <span class="fancy-font">Fam.ly</span>!</h1>
        <p class="description">Strengthen your connections with discovering more about your family.</p>
      </div>
    </section>

    <!-- Show CreateProfile component if logged in but profile is not complete -->
    <CreateProfile v-if="isLoggedIn && !isProfileComplete" />

    <!-- Show PostListComponent only if profile is complete -->
    <PostListComponent v-if="isLoggedIn && isProfileComplete" />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
