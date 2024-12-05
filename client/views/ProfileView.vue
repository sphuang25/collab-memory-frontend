<script setup lang="ts">
import ProfilingComponent from "@/components/Profiling/ProfilingComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { ref, onMounted } from "vue";
import { fetchy } from "@/utils/fetchy";

// Access user state from the store
const { isLoggedIn, currentUsername } = storeToRefs(useUserStore());

// State to store the selected profile goals
const selectedGoals = ref<string[]>([]);

// Fetch the user profile data
const fetchProfile = async () => {
  try {
    const response = await fetchy("/api/profile", "GET"); // Adjust endpoint if necessary
    selectedGoals.value = response.selectedChoices;
  } catch (error) {
    console.error("Error fetching profile data:", error);
    selectedGoals.value = [];
  }
};

const choicesSelected = async () => {
  try {
    const choices = await fetchy("/api/profiles", "GET"); // Adjust endpoint if necessary
    selectedGoals.value = choices;
  } catch (_) {
    return;
  }
};

// Fetch profile data on component mount if logged in and profile is complete
onMounted(async () => {
  if (isLoggedIn.value && selectedGoals.value !== 0) {
    await fetchProfile();
  }
  await choicesSelected();
});
</script>

<template>
  <main class="column">
    <!-- Show ProfilingComponent if the user is logged in but hasn't completed their profile -->
    <section v-if="isLoggedIn && selectedGoals.value === 0">
      <h2>Hello {{ currentUsername }}! Let's set up your profile.</h2>
      <ProfilingComponent />
    </section>

    <!-- Show user's selected goals if the profile is complete -->
    <section v-if="isLoggedIn && selectedGoals.value !== 0">
      <h2>Your Fam.ly Profile</h2>
      <div v-if="selectedGoals.length > 0">
        <p><strong>Your Goals:</strong></p>
        <ul>
          <li v-for="(goal, index) in selectedGoals" :key="index">
            {{ goal }}
          </li>
        </ul>
      </div>
      <div v-else>
        <p>Loading your profile...</p>
      </div>
    </section>

    <!-- Show a message if the user is not logged in -->
    <section v-if="!isLoggedIn">
      <h2>Please log in to view or update your profile.</h2>
    </section>
  </main>
</template>

<style scoped>
main {
  padding: 20px;
  text-align: center;
}

h2 {
  margin-bottom: 20px;
  font-family: "Montserrat", sans-serif;
}

.column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

ul {
  list-style-type: disc;
  margin: 10px 0;
  padding-left: 20px;
}

li {
  font-size: 1rem;
  color: #333;
}
</style>
