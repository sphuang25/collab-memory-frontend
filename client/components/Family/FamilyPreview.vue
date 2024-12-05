<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
const props = defineProps(["family"]);
const emit = defineEmits(["refreshFamilies"]);

const { currentUsername } = storeToRefs(useUserStore());

import { format, formatDistanceToNow } from "date-fns";

const formatDateDashed = (date: string) => {
  return format(new Date(date), "yyyy-MM-dd"); // Formats as 2024-11-16
};

const formatRelativeTime = (date: string) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true }); // Formats relative time (e.g., '3 days ago')
};

const members = ref<Array<Record<string, string>>>([]);
const familyTitle = ref("");
const memberUsernames = ref("");

const getFamilyMembers = async () => {
  try {
    members.value = await fetchy(`/api/family/member/${props.family.familyID}`, "GET");
    memberUsernames.value = (await fetchy(`/api/family/member/name/${props.family.familyID}`, "GET")).join(",");
  } catch {
    return;
  }
};

const getFamilyTitle = async () => {
  let familyTitleResult;
  try {
    familyTitleResult = await fetchy(`/api/family/name/${props.family.familyID}`, "GET");
  } catch {
    return;
  }
  familyTitle.value = familyTitleResult;
};

onBeforeMount(async () => {
  await getFamilyMembers();
  await getFamilyTitle();
});
</script>

<template>
  <div class="card" @click="router.push(`/family/${props.family.familyID}`)">
    <div class="cardTitle">
      <p class="threadTitle">{{ familyTitle }}</p>
    </div>
    <div class="base">
      <article class="member">
        <p>Members: {{ memberUsernames }}</p>
      </article>
    </div>
    <div class="base">
      <article class="timestamp">
        <p>Created {{ formatDateDashed(props.family.dateCreated) }}</p>
      </article>
    </div>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
  color: #3f3f44;
  margin-bottom: 10px;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 1;
  margin: 0;
}

.timestamp p {
  font-size: 1em;
}

.threadTitle {
  font-weight: bold;
  font-size: 1.5em;
  margin-bottom: 15px;
}

.cardTitle {
  padding: 10px;
}

.card {
  position: relative;
  height: 100%;
  width: 100%;
  border-radius: 1em;
  padding: 5px;
}

.card:hover {
  filter: brightness(90%);
  cursor: pointer;
}

.author {
  position: absolute;
  bottom: 10px;
  right: 15px;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.member {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
  flex-direction: column;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
  flex-direction: column;
}

.base {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1em;
  padding: 10px;
}
</style>
