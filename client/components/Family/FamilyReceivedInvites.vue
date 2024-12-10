<script setup lang="ts">
import { useUserStore } from "@/stores/user"; // Import user store
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
// Import CreateProfile component
import { onBeforeMount, ref } from "vue";
import FamilyReceivedInviteCard from "./FamilyReceivedInviteCard.vue";

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

onBeforeMount(async () => {
  await getInvites();
});
</script>

<template>
  <div v-if="isLoggedIn" class="folderBody">
    <div id="trapezoid"><h3 class="familySideTitle">Invites</h3></div>
    <section>
      <h3 class="familyMainTitle">Invitations</h3>
      <div v-if="invites.length !== 0">
        <article v-for="invite in invites" :key="invite._id">
          <FamilyReceivedInviteCard :invite="invite" @refreshInvites="getInvites" />
        </article>
      </div>
      <p class="centerMessage" v-else>Cleared! There is no invitation.</p>
    </section>
  </div>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 2em;
  margin: 0 auto;
  width: 90%;
  min-height: calc(100vh - 200px);
  align-items: flex-start;
  justify-content: flex-start;
  height: auto;
  flex-wrap: wrap;
  padding: 1em;
  box-sizing: border-box;
  overflow-y: scroll;
  justify-items: center;
}

h1 {
  text-align: center;
}

h3 {
  text-align: center;
  max-height: 10%;
  min-height: 10%;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  width: calc(50% - 1em);
  box-sizing: border-box;
  min-width: 100%;
  max-height: 250px;
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
}

.centerMessage {
  color: #3f3f44;
  text-align: center;
  font-size: 20px;
  width: 100%;
}
</style>
