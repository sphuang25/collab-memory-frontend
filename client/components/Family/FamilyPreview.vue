<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
const props = defineProps(["family"]);
const emit = defineEmits(["refreshFamilies"]);
const { currentUsername } = storeToRefs(useUserStore());

const members = ref("");
const familyTitle = ref("");

const getFamilyMembers = async () => {
  let membersResult;
  try {
    membersResult = await fetchy(`/api/family/member/${props.family.familyID}`, "GET");
  } catch {
    return;
  }
  members.value = membersResult.names[0];
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

const leaveFamily = async () => {
  try {
    await fetchy(`/api/family/${props.family.familyID}/member/${currentUsername.value}`, "DELETE");
    emit("refreshFamilies");
  } catch {
    return;
  }
};

// const getFriendInterface = async (friendName: string) => {
//   friendInterface.value = await fetchy(`/api/interface/check/${friendName}`, "GET");
// };

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
      <article class="timestamp">
        <p>Members: {{ members }}</p>
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
