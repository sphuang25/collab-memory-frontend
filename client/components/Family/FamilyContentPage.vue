<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";
const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);

const { currentUsername } = storeToRefs(useUserStore());
const members = ref("");
const familyTitle = ref("");

const route = useRoute();
const threadId = String(route.params.id);

const getFamilyMembers = async () => {
  let membersResult;
  try {
    membersResult = await fetchy(`/api/family/member/${threadId}`, "GET");
  } catch {
    return;
  }
  members.value = membersResult.names[0];
};

const getFamilyTitle = async () => {
  let familyTitleResult;
  try {
    familyTitleResult = await fetchy(`/api/family/name/${threadId}`, "GET");
  } catch {
    return;
  }
  familyTitle.value = familyTitleResult;
};

const leaveFamily = async () => {
  try {
    await fetchy(`/api/family/${threadId}/member/${currentUsername.value}`, "DELETE");
    await router.push(`/family`);
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
  <div v-if="isLoggedIn" class="folderBody">
    <div class="card">
      <div id="trapezoid"><h3 class="familySideTitle">Families</h3></div>

      <p class="familyMainTitle">{{ familyTitle }}</p>

      <p>Members: {{ members }}</p>

      <menu>
        <p>
          <button class="btn-small pure-button" @click="leaveFamily">Leave Family</button>
        </p>
      </menu>
    </div>
  </div>
</template>

<style scoped>
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
  font-weight: bold;
}
</style>
