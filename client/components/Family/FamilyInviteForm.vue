<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { ref } from "vue";
const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const props = defineProps(["familyID"]);
const username = ref("");

const sendInvite = async (username: string) => {
  try {
    await fetchy(`/api/family/invite`, "POST", { body: { username: username, familyID: props.familyID } });
  } catch {
    return;
  }
};

const emptyForm = () => {
  username.value = "";
};
</script>

<template>
  <form @submit.prevent="sendInvite(username)">
    <p>Invite an User</p>
    <label for="content"></label>
    <input id="content" v-model="username" placeholder="type in the username..." />
    <button type="submit" class="pure-button-primary pure-button">Invite</button>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1em;
  width: 70%;
  align-items: center;
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

form {
  background-color: var(--base-bg);
  border-radius: 1em;
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

section {
  display: flex;
  flex-direction: column;
  gap: 1em;
  width: 70%;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.posts {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
