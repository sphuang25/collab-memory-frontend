<script setup lang="ts">
import { useUserStore } from "@/stores/user"; // Import user store
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
// Import CreateProfile component
import { onBeforeMount, ref } from "vue";
import FamilyCreateForm from "./FamilyCreateForm.vue";
import FamilyPreview from "./FamilyPreview.vue";

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
  <div v-if="isLoggedIn" class="folderBody">
    <div id="trapezoid"><h3 class="familySideTitle">Home</h3></div>
    <h3 class="familyMainTitle">Families List</h3>
    <section class="threads" v-if="loaded">
      <article v-for="family in families" :key="family._id">
        <div id="trapezoid"><h3 class="familySideTitle">Family</h3></div>
        <FamilyPreview :family="family" @refreshFamilies="getFamilies" />
      </article>
      <FamilyCreateForm class="familyPreview" @refreshFamilies="getFamilies" />
    </section>
  </div>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: row;
  gap: 2em;
  margin: 0 auto;
  width: 90%;
  height: calc(100vh - 200px);
  flex-wrap: wrap;
  padding: 1em;
  box-sizing: border-box;
  overflow-y: scroll;
  justify-content: center;
}

h1 {
  text-align: center;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  width: calc(50% - 1em);
  box-sizing: border-box;
  max-width: 40%;
  min-height: 250px;
  max-height: 250px;
}

.familyPreview {
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  width: calc(40% - 1em);
  box-sizing: border-box;
  max-width: 0%;
  min-height: 250px;
  max-height: 250px;
}

.folderBody {
  background-color: white;
  width: 100%;
  height: calc(100vh - 95px);
  margin-right: 40px;
  border-radius: 50px 50px 0px 0px;
  position: relative;
  margin-top: 10vh;
}

#trapezoid {
  position: absolute;
  top: 90px;
  left: -110px;
  border-bottom: 80px solid white;
  border-left: 60px solid transparent;
  border-right: 60px solid transparent;
  transform: rotate(-90deg);
  height: 0;
  width: 110px;
}

.threads {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}

.familySideTitle {
  color: #3f3f44;
  text-align: center;
}

.familyMainTitle {
  color: #3f3f44;
  text-align: center;
  font-size: 30px;
}
</style>
