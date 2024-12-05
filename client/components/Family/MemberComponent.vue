<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";
const props = defineProps(["member"]);
const emit = defineEmits(["refreshMembers"]);
const { currentUsername } = storeToRefs(useUserStore());

const username = ref("");

import { format } from "date-fns";

const formatDateDashed = (date: string) => {
  return format(new Date(date), "yyyy-MM-dd"); // Formats as 2024-11-16
};

const getUser = async () => {
  try {
    username.value = (await fetchy(`/api/users/user/${props.member.userID}`, "GET")).username;
  } catch {
    return;
  }
};

const removeMember = async () => {
  try {
    await fetchy(`/api/family/${props.member.userID}`, "DELETE");
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
  <p class="timestamp">Join since: {{ formatDateDashed(props.member.dateCreated) }}</p>
  <div class="base">
    <article class="timestamp"></article>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.timestamp {
  font-size: 0.25em;
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
