<script setup lang="ts">
import { useUserStore } from "@/stores/user"; // Import user store
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
// Import CreateProfile component
import FamilyCreateForm from "@/components/Family/FamilyCreateForm.vue";
import FamilyPreview from "@/components/Family/FamilyPreview.vue";
import { onBeforeMount, ref } from "vue";

const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);

const loaded = ref(false);
let families = ref<Array<Record<string, string>>>([]);
let requests = ref<Array<Record<string, string>>>([]);

async function getFamilies() {
  let familyResults;
  try {
    familyResults = await fetchy("/api/family", "GET");
  } catch (_) {
    return;
  }
  families.value = familyResults;
}

async function getRequests() {
  let requestResults;
  try {
    requestResults = await fetchy("/api/family/request", "GET");
  } catch (_) {
    return;
  }
  requests.value = requestResults;
}

onBeforeMount(async () => {
  await getFamilies();
  await getRequests();
  loaded.value = true;
});
</script>

<template>
  <main>
    <!-- Welcome Section for Users Not Logged In -->
    <!-- <section v-if="isLoggedIn">
      <h2>Request to join a family:</h2>
      <FamilyRequestForm @refreshRequests="getRequests" />
    </section> -->

    <section v-if="isLoggedIn">
      <h2>Create a family:</h2>
      <FamilyCreateForm @refreshFamilies="getFamilies" />
    </section>
    <!-- 
    <h2>Pending Family Request</h2>
    <section class="requests" v-if="loaded && requests.length !== 0">
      <article v-for="request in requests" :key="request._id">
        <RequestComponent :request="request" @refreshRequests="getRequests" />
      </article>
    </section> -->

    <h2>Families</h2>

    <section v-if="loaded && families.length !== 0">
      <article v-for="family in families" :key="family._id">
        <FamilyPreview :family="family" @refreshFamilies="getFamilies" />
      </article>
    </section>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
