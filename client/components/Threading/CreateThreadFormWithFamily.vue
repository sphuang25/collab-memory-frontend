<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const title = ref("");
const showForm = ref(false);
const emit = defineEmits(["refreshThreads"]);
let families = ref<Array<Record<string, string>>>([]);
const familyToPost = ref("");

async function getFamilies() {
  let familyResults;
  try {
    familyResults = await fetchy("/api/family/docs", "GET");
  } catch (_) {
    return;
  }
  families.value = familyResults;
}

const createThread = async (title: string) => {
  try {
    await fetchy(`/api/threads/familyname/${familyToPost.value}`, "POST", { body: { title: title } });
  } catch (_) {
    return;
  }
  emit("refreshThreads");
  emptyForm();
};

const emptyForm = () => {
  title.value = "";
  showForm.value = false;
};

const toggleForm = () => {
  showForm.value = !showForm.value; // Toggle form visibility
};

onBeforeMount(async () => {
  await getFamilies();
});
</script>

<template>
  <article class="threadCreate" @click="toggleForm"><div class="plusSign">+</div></article>
  <div v-if="showForm" class="popup">
    <form @submit.prevent="createThread(title)">
      <div style="text-align: center">
        Choose Family:<select class="dropdown" v-model="familyToPost">
          <option v-for="family in families" :key="family._id" :value="family.familyTitle" ref="items">
            {{ family.familyTitle }}
          </option>
        </select>
      </div>
      <textarea v-model="title" placeholder="Enter thread title" required></textarea>
      <button type="submit">Create</button>
      <button type="button" @click="toggleForm">Cancel</button>
    </form>
  </div>
</template>

<style scoped>
.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 1em;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding: 2em;
  z-index: 1000;
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

button[type="submit"] {
  background-color: #c39d1f;
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
.threadCreate {
  background-color: white;
  border-radius: 1em;
  border: dashed #d8d8d8;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
  width: calc(33.33% - 1em);
  box-sizing: border-box;
  max-width: 30%;
  max-height: 250px;
}

.threadCreate:hover {
  background-color: rgb(215, 215, 215);
  cursor: pointer;
}

.threadCreate:hover .plusSign {
  color: #acacac;
}
</style>
