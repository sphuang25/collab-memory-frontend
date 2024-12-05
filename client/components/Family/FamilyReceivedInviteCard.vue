<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { ref } from "vue";
const props = defineProps(["invite"]);
const emit = defineEmits(["refreshInvites"]);
const { currentUsername } = storeToRefs(useUserStore());

const fromUsername = ref("");
const toUsername = ref("");

// const getFromUser = async () => {
//   try {
//     const user = await fetchy(`/api/users/user/${props.invite.fromID}`, "GET");
//     fromUsername.value = user.username;
//   } catch {
//     return;
//   }
// };

// const getToUser = async () => {
//   try {
//     const user = await fetchy(`/api/users/user/${props.invite.toID}`, "GET");
//     toUsername.value = user.username;
//   } catch {
//     return;
//   }
// };

// const removeFamilyInvite = async () => {
//   try {
//     await fetchy(`/api/family/${props.invite.familyID}/invite/${props.invite.toID}`, "DELETE");
//   } catch {
//     return;
//   }
//   emit("refreshInvites");
// };

// onBeforeMount(async () => {
//   await getFromUser();
//   await getToUser();
// });
</script>

<template>
  <p>invite here</p>
  <!-- <p class="sender">Inviting: {{ toUsername }}</p>
  <div class="base">
    <article class="timestamp">
      <p>invited by {{ fromUsername }}</p>
    </article>
    <article class="timestamp">
      <p>Request sent: {{ formatDate(props.invite.dateCreated) }}</p>
    </article>
    <menu v-if="fromUsername == currentUsername">
      <p><button class="button-error btn-small pure-button" @click="removeFamilyInvite">Delete</button></p>
    </menu>
  </div> -->
</template>

<style scoped>
p {
  margin: 0em;
}

.sender {
  font-weight: bold;
  font-size: 1.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: 1em;
  padding: 1;
  margin: 0;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

.base {
  display: flex;
  flex-direction: column;
}

.base article:only-child {
  margin-left: auto;
}
</style>
