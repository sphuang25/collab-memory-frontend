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

// const leaveFamily = async () => {
//   try {
//     await fetchy(`/api/friends/${props.friend.friendName}`, "DELETE");
//   } catch {
//     return;
//   }
//   emit("refreshFriends");
// };

const getFamilyMembers = async () => {
  let membersResult;
  try {
    membersResult = await fetchy(`/api/family/member`, "GET", { body: { familyID: props.family.familyID } });
  } catch {
    return;
  }
  members.value = membersResult.names[0];
};

// const getFriendInterface = async (friendName: string) => {
//   friendInterface.value = await fetchy(`/api/interface/check/${friendName}`, "GET");
// };

onBeforeMount(async () => {
  await getFamilyMembers();
});
</script>

<template>
  <p>FamilyID: {{ props.family.familyID }}</p>
  <!-- <p>Members: {{ members }}</p> -->
</template>
