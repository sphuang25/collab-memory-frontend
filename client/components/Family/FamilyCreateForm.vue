<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const content = ref("");
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
  content.value = "";
};
</script>

<template>
  <form @submit.prevent="createFamily(content)">
    <label for="content"></label>
    <input id="content" v-model="content" placeholder="type in the family name" />
    <button type="submit" class="pure-button-primary pure-button">Create Family!</button>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  width: 30em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}
</style>
