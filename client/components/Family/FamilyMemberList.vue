<script setup lang="ts">
// import CreateFriendRequestForm from "@/components/Friend/CreateFriendRequestForm.vue";
// import ReceivedRequestComponent from "@/components/Friend/ReceivedRequestComponent.vue";
// import SentRequestComponent from "@/components/Friend/SentRequestComponent.vue";
import MemberComponent from "./MemberComponent.vue";

import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const props = defineProps(["familyID"]);
const loaded = ref(false);
let members = ref<Array<Record<string, string>>>([]);

const getFamilyMembers = async () => {
  try {
    members.value = await fetchy(`/api/family/member/${props.familyID}`, "GET");
  } catch {
    return;
  }
};

onBeforeMount(async () => {
  await getFamilyMembers();
  loaded.value = true;
});
</script>

<template>
  <section v-if="members.length !== 0">
    <article v-for="member in members" :key="member._id">
      <MemberComponent :member="member" @refreshMembers="getFamilyMembers" />
    </article>
  </section>
</template>

<style scoped>
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
  max-width: 70%;
  min-width: 50%;
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
