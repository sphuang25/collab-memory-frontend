<script setup lang="ts">
// import CreateFriendRequestForm from "@/components/Friend/CreateFriendRequestForm.vue";
// import ReceivedRequestComponent from "@/components/Friend/ReceivedRequestComponent.vue";
// import SentRequestComponent from "@/components/Friend/SentRequestComponent.vue";
import MemberComponent from "./MemberComponent.vue";

import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";
const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const props = defineProps(["familyID"]);
const loaded = ref(false);
let members = ref<Array<Record<string, string>>>([]);
let requests = ref<Array<Record<string, string>>>([]);

const getFamilyMembers = async () => {
  let membersResult;
  try {
    membersResult = await fetchy(`/api/family/member/${props.familyID}`, "GET");
  } catch {
    return;
  }
  members.value = membersResult;
};

async function getRequests() {
  let requestResults;
  try {
    requestResults = await fetchy("/api/request", "GET");
  } catch (_) {
    return;
  }
  requests.value = requestResults;
}
let sentPendingRequests = computed(() => requests.value.filter((x) => x.status === "pending" && x.from === currentUsername.value && x.to !== "DELETED_USER"));
let receivedPendingRequests = computed(() => requests.value.filter((x) => x.status === "pending" && x.to === currentUsername.value && x.from !== "DELETED_USER"));

onBeforeMount(async () => {
  await getFamilyMembers();
  //   await getRequests();
  loaded.value = true;
});
</script>

<template>
  <!-- <section v-if="isLoggedIn">
    <h2>Invite a member:</h2>
    <CreateFriendRequestForm @refreshRequests="getRequests" />
  </section> -->

  <h2>Members</h2>
  <p style="font-weight: bold; text-align: center">{{ members.length }}</p>
  <section class="friends" v-if="members.length !== 0">
    <article v-for="member in members" :key="member._id">
      <MemberComponent :member="member" @refreshMembers="getFamilyMembers" />
    </article>
  </section>
  <!-- <p v-else>You currently have no friend...</p>
  <h2>Invite</h2>
  <section class="requests" v-if="loaded && sentPendingRequests.length !== 0">
    <article v-for="request in sentPendingRequests" :key="request._id">
      <SentRequestComponent :request="request" @refreshRequests="getRequests" />
    </article>
  </section>
  <p v-else>Make some friends!</p>
  <h2>Requests</h2>
  <section class="requests" v-if="loaded && receivedPendingRequests.length !== 0">
    <article v-for="request in receivedPendingRequests" :key="request._id">
      <ReceivedRequestComponent :request="request" @refreshRequests="getRequests" @refreshFriends="getFriends" />
    </article>
  </section>
  <p v-else>Friend Request inbox is clear!</p> -->
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
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
