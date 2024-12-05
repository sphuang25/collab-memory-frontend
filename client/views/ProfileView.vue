<script setup lang="ts">
import ProfilingComponent from "@/components/Profiling/ProfilingComponent.vue";
import EditProfilingComponent from "@/components/Profiling/EditProfilingComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { ref, onBeforeMount } from "vue";
import { fetchy } from "@/utils/fetchy";

// Access user state from the store
const { isLoggedIn, currentUsername } = storeToRefs(useUserStore());
const toggleProfile = ref(false);

// State to store the selected profile goals
const selectedGoals = ref<string[]>([]);

const isProfileComplete = ref(false);
const loaded = ref(false);

// Fetch the user profile data
const fetchProfile = async () => {
  try {
    const response = await fetchy("/api/profiles/user", "GET"); // Adjust endpoint if necessary
    selectedGoals.value = response.selectedChoices || [];
    isProfileComplete.value = selectedGoals.value.length > 0;
  } catch (_) {
    console.log(_, "e2");
    selectedGoals.value = [];
    isProfileComplete.value = false;
    return;
  }
};

const choicesSelected = async () => {
  try {
    const choices = await fetchy("/api/profiles", "GET"); // Adjust endpoint if necessary
    selectedGoals.value = choices;
  } catch (_) {
    console.log(_, "e");
    return;
  }
};

const toggle = () => {
  console.log("clicked!");
  toggleProfile.value = !toggleProfile.value;
};

// Fetch profile data on component mount if logged in and profile is complete
onBeforeMount(async () => {
  await fetchProfile();
  await choicesSelected();
  loaded.value = true;
});
</script>

<template>
  <main class="column">
    <!-- Show ProfilingComponent if the user is logged in but hasn't completed their profile -->
    <div v-if="isLoggedIn && loaded">
      <section v-if="!isProfileComplete">
        <h2>Hello {{ currentUsername }}! Let's set up your profile.</h2>
        <ProfilingComponent class="profilePrompt" @refreshProfile="fetchProfile()" />
      </section>

      <section v-else-if="toggleProfile && isProfileComplete">
        <h2>Hello {{ currentUsername }}! Let's update your profile.</h2>
        <EditProfilingComponent class="profilePrompt" @updated="toggle()" @refreshProfile="fetchProfile()" />
      </section>

      <!-- Show user's selected goals if the profile is complete -->
      <section v-else-if="isProfileComplete && !toggleProfile">
        <h2>Your Fam.ly Profile</h2>
        <div v-if="isProfileComplete" class="goalsList">
          <p><strong>Your Goals:</strong></p>
          <ul>
            <li v-for="(goal, index) in selectedGoals" :key="index">
              {{ goal }}
            </li>
          </ul>
          <button @click="toggle()">Update Goals</button>
        </div>
      </section>
    </div>
    <div v-else-if="!loaded" class="loading">Loading...</div>
    <!-- Show a message if the user is not logged in -->
    <section v-if="!isLoggedIn">
      <h2>Please log in to view or update your profile.</h2>
    </section>
  </main>
</template>

<style scoped>
main {
  text-align: center;
}

.loading {
  margin-top: 20%;
  font-size: 30px;
}

h2 {
  margin-bottom: 20px;
  font-family: "Montserrat", sans-serif;
  font-size: 30px;
}

.profilePrompt {
  position: relative;
}

button {
  width: 150px;
  height: 50px;
  font-size: 20px;
  border-radius: 20px;
  background-color: #c39d1f;
  color: white;
  border: none;
  padding: 2px;
}

button:hover {
  transform: scale(1.1);
  cursor: pointer;
}

.goalsList {
  background-color: white;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 40vh;
  width: 40vw;
  font-size: 30px;
}

.column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  top: 5%;
}

ul {
  list-style-type: disc;
  margin: 10px 0;
  padding-left: 20px;
}

li {
  font-size: 1.5rem;
  color: #333;
  list-style: none;
  margin-top: 10px;
  margin-bottom: 20px;
}
</style>
