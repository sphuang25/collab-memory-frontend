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
let invites = ref<Array<Record<string, string>>>([]);

async function getInvites() {
  try {
    invites.value = await fetchy("/api/family/invite", "GET");
  } catch (_) {
    return;
  }
}

async function getFamilies() {
  let familyResults;
  try {
    familyResults = await fetchy("/api/family", "GET");
  } catch (_) {
    return;
  }
  families.value = familyResults;
}

onBeforeMount(async () => {
  await getFamilies();
  await getInvites();
});
</script>

<template>
  <div v-if="isLoggedIn" class="folderBody">
    <div id="trapezoid"><h3 class="familySideTitle">Home</h3></div>

    <section>
      <h3 class="familyMainTitle">Families List</h3>
      <article v-for="family in families" :key="family._id">
        <FamilyPreview :family="family" @refreshFamilies="getFamilies" />
      </article>
      <article>
        <FamilyCreateForm class="familyPreview" @refreshFamilies="getFamilies" />
      </article>
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

.familyInstr {
  margin: 0;
  margin-bottom: 20px;
  color: #3f3f44;
  text-align: center;
}
.familyGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Two equal-width columns */
  gap: 1em; /* Add spacing between grid items */
  width: 100%; /* Ensure the grid takes up the full width */
  margin: 0 auto; /* Center the grid if needed */
  box-sizing: border-box;
  align-content: center;
}

/*article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  width: calc(30% - 1em);
  box-sizing: border-box;
  min-width: 100%;
  max-height: 250px;
}*/

article,
.familyPreview {
  width: 100%; /* Grid items inherit width from the grid cell */
  min-height: 250px;
  border-radius: 1em;
  box-sizing: border-box;
  background-color: var(--base-bg);
  display: flex;
  flex-direction: column;
  gap: 0em;
  width: 350px;
  margin-left: 30px;
}

.articleForInvite {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 2em;
  border: 1px solid black;
  outline-style: outset;
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

div {
  width: 50%;
  align-items: center;
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
  width: 100%;
  margin: 0;
  padding-top: 20px;
}
</style>
