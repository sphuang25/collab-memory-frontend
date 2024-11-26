<template>
  <div class="view-profile-container">
    <h2>User Profile</h2>

    <div v-if="profile">
      <p><strong>Username:</strong> {{ profile.username }}</p>
      <div>
        <strong>Goals within Fam.ly:</strong>
        <ul>
          <li v-for="(goal, index) in profile.selectedGoals" :key="index">
            {{ goal }}
          </li>
        </ul>
      </div>
    </div>
    <div v-else>
      <p>Loading profile...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

interface Profile {
  username: string;
  selectedGoals: string[];
}

const profile = ref<Profile | null>(null);

const fetchProfile = async () => {
  try {
    const response = await fetchy("/api/session", "GET");
    const user = response.data;

    // Fetch the user's goals
    const goalsResponse = await fetchy(`/api/profile/${user.username}`, "GET");

    profile.value = {
      username: user.username,
      selectedGoals: goalsResponse.selectedChoices,
    };
  } catch (err) {
    console.error("Error fetching profile:", err);
    profile.value = null;
  }
};

onMounted(() => {
  void fetchProfile();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Montserrat:wght@400&display=swap");

.view-profile-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2em;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: "Poppins", sans-serif;
  text-align: center;
}

h2 {
  font-family: "Montserrat", sans-serif;
  color: #333;
  margin-bottom: 1em;
}

p {
  font-size: 1.1em;
  color: #555;
  margin-bottom: 1em;
}

ul {
  list-style-type: disc;
  margin: 0;
  padding: 0;
  text-align: left;
}

ul li {
  font-size: 1em;
  color: #333;
  margin: 0.5em 0;
}
</style>
