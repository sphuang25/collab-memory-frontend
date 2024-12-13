<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const options = ["Learn family history", "Connect more often", "Learn others' interests", "Learn about identity"];
const selectedGoals = ref<string[]>([]);
const emit = defineEmits(["updated", "refreshProfile"]);

const udpateProfile = async () => {
  if (selectedGoals.value.length === 0) {
    alert("Please select at least one goal.");
    return;
  }

  try {
    const response = await fetchy("/api/profiles", "PATCH", {
      body: { newChoices: selectedGoals.value },
    });
  } catch (e) {
    alert("There was an error submitting your profile. Please try again.");
  }

  emptyForm();
  emit("updated");
  emit("refreshProfile");
};

const emptyForm = () => {
  selectedGoals.value = [];
};
</script>

<template>
  <div class="profiling-form-container">
    <form class="profiling-form" @submit.prevent="udpateProfile">
      <h2>What are your goals in Fam.ly?</h2>

      <div class="form-group">
        <label>Select your goals (you can choose multiple):</label>
        <div v-for="(option, index) in options" :key="index" class="checkbox-group">
          <input type="checkbox" :id="'option-' + index" :value="option" v-model="selectedGoals" />
          <label :for="'option-' + index">{{ option }}</label>
        </div>
      </div>

      <button class="submit-button" type="submit">Update</button>
    </form>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Montserrat:wght@400&display=swap");

.profiling-form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1em;
  position: relative;
}

.profiling-form {
  background: #ffffff;
  padding: 2em;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 450px;
  width: 100%;
  font-family: "Poppins", sans-serif;
}

h2 {
  text-align: center;
  font-family: "Montserrat", sans-serif;
  color: #333;
  margin-bottom: 1em;
}

.form-group {
  margin-bottom: 1.5em;
}

.checkbox-group {
  display: flex;
  align-items: center;
  margin-bottom: 0.8em;
  margin-top: 10px;
  margin-left: 25%;
}

.checkbox-group input {
  margin-right: 0.5em;
}

label {
  font-size: 1em;
  color: #555;
}

.submit-button {
  display: block;
  width: 100%;
  padding: 1em;
  background-color: #6cae75;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: "Poppins", sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
}

.submit-button:hover {
  background-color: #558b5a;
}

.submit-button:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(255, 123, 84, 0.3);
}
</style>
