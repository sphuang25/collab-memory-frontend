<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const familyTitle = ref("");
const toJoinFamilyID = ref("");
const showForm = ref(false);
const emit = defineEmits(["refreshFamilies"]);

const createFamily = async (familyName: string) => {
  try {
    await fetchy(`/api/family`, "POST", { body: { familyTitle: familyName } });
  } catch (_) {
    return;
  }
  emit("refreshFamilies");
  emptyForm();
};

const emptyForm = () => {
  familyTitle.value = "";
  showForm.value = false;
};

const toggleForm = () => {
  showForm.value = !showForm.value; // Toggle form visibility
};

const disableForm = () => {
  showForm.value = false; // Toggle form visibility
};
</script>

<template>
  <article class="familyCreate" @click="toggleForm"><div class="plusSign">+</div></article>
  <div v-if="showForm" class="popup">
    <form @submit.prevent="createFamily(familyTitle)">
      <font-awesome-icon class="return" :icon="['fas', 'xmark']" @click="disableForm" />
      <p class="boldTitle">Create a family!</p>
      <textarea v-model="familyTitle" placeholder="Name your family..."></textarea>
      <button class="buttonCreate" type="submit">Create family!</button>
    </form>
  </div>
</template>

<style scoped>
.popup {
  position: fixed;
  top: 70%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 1em;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding: 2em;
  z-index: 1000;
}

.return {
  position: fixed;
  top: 5%;
  left: 90%;
}

.return:hover {
  background: rgb(191, 191, 191);
  cursor: pointer;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

button {
  padding: 0.5em 1em;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.boldTitle {
  font-weight: bold;
  font-size: 1.5em;
  margin-bottom: 15px;
}

.buttonBack {
  background-color: #1f27c3;
  color: white;
}

.buttonCreate {
  background-color: #c39d1f;
  color: white;
}

.buttonRequest {
  background-color: #f8762b;
  color: white;
}

button[type="button"] {
  background-color: #f44336;
  color: white;
}

.plusSign {
  color: #d8d8d8;
  font-size: 40px;
  margin: auto;
}
.familyCreate {
  background-color: white;
  border-radius: 1em;
  border: dashed #d8d8d8;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
  width: 100%;
  box-sizing: border-box;
  max-height: 250px;
  min-height: 250px;
}

.familyCreate:hover {
  background-color: rgb(215, 215, 215);
  cursor: pointer;
}

.familyCreate:hover .plusSign {
  color: #acacac;
}
</style>
