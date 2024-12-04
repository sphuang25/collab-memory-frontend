<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";
const props = defineProps(["member"]);
const emit = defineEmits(["refreshMembers"]);
const { currentUsername } = storeToRefs(useUserStore());

const username = ref("");

const getUser = async () => {
  try {
    username.value = (await fetchy(`/api/users/user/${props.member.userID}`, "GET")).username;
  } catch {
    return;
  }
};

const removeMember = async () => {
  try {
    await fetchy(`/api/friends/${props.member.userID}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshMembers");
};

onBeforeMount(async () => {
  await getUser();
});
</script>

<template>
  <p class="sender">{{ username }}</p>
  <p class="timestamp">Join since: {{ formatDate(props.member.dateCreated) }}</p>
  <div class="base">
    <article class="timestamp"></article>
    <menu>
      <p><button class="btn-small pure-button" @click="removeMember">Remove</button></p>
    </menu>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.5em;
  font-style: italic;
  font-weight: lighter;
}

.sender {
  font-weight: bold;
  font-size: 1.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
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
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}
</style>
