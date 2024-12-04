<script setup lang="ts">
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
  // try {
  await fetchy(`/api/family/${props.family.familyID}/member/${currentUsername.value}`, "DELETE");
  // } catch {
  //   return;
  // }
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
  <!-- <p>Members: {{ members }}</p> -->
  <article>
    <p class="sender"></p>
    <div class="base">
      <div class="title">{{ familyTitle }}</div>

      <div>Members: {{ members }}</div>
      <menu>
        <p><button class="btn-small pure-button" @click="leaveFamily">Remove</button></p>
      </menu>
    </div>
  </article>
</template>

<style scoped>
p {
  margin: 0em;
}

.title {
  font-weight: bold;
  font-size: 2em;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  flex-direction: column;
  align-items: left;
  gap: 0.5em;
  padding: 1em;
}
</style>
