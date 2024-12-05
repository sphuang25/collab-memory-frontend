<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";
import FamilyMemberList from "./FamilyMemberList.vue";
const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);

const { currentUsername } = storeToRefs(useUserStore());
const members = ref("");
const familyTitle = ref("");
const familyPage = ref(""); // members, threads

const route = useRoute();
const familyID = String(route.params.id);

const getFamilyTitle = async () => {
  let familyTitleResult;
  try {
    familyTitleResult = await fetchy(`/api/family/name/${familyID}`, "GET");
  } catch {
    return;
  }
  familyTitle.value = familyTitleResult;
};

const leaveFamily = async () => {
  try {
    await fetchy(`/api/family/${familyID}/member/${currentUsername.value}`, "DELETE");
    await router.push(`/`);
  } catch {
    return;
  }
};

const membersPage = () => {
  familyPage.value = "members";
};

const threadsPage = () => {
  familyPage.value = "threads";
};

const requestsPage = () => {
  familyPage.value = "requests";
};

// const getFriendInterface = async (friendName: string) => {
//   friendInterface.value = await fetchy(`/api/interface/check/${friendName}`, "GET");
// };

onBeforeMount(async () => {
  await getFamilyTitle();
});
</script>

<template>
  <div v-if="isLoggedIn" class="folderBody">
    <div id="trapezoid"><h3 class="familySideTitle">Family</h3></div>
    <h1 class="familyMainTitle">{{ familyTitle }}</h1>
    <div>
      <menu>
        <p v-if="familyPage === `members`" class="oval selected" @click="membersPage">Members</p>
        <p v-else class="oval" @click="membersPage">Members</p>
        <p v-if="familyPage === `requests`" class="oval selected" @click="requestsPage">Invites</p>
        <p v-else class="oval" @click="requestsPage">Invites</p>
        <p v-if="familyPage === `threads`" class="oval selected" @click="threadsPage">Threads</p>
        <p v-else class="oval" @click="threadsPage">Threads</p>
        <p class="oval" @click="leaveFamily">Leave Family</p>
      </menu>
    </div>
    <div>
      <section v-if="familyPage === `members`">
        <FamilyMemberList :familyID="familyID" />
      </section>
      <p class="familyMainTitle" v-else-if="familyPage === `requests`">Requests will be placed here!</p>
      <p class="familyMainTitle" v-else-if="familyPage === `threads`">Threads will be placed here!</p>
    </div>
  </div>
</template>

<style scoped>
menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 1;
  margin: 0;
  font-weight: bold;
  justify-content: space-evenly;
}

.menu:hover {
  background: rgb(191, 191, 191);
  cursor: pointer;
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
  padding: 0.5em;
}

.oval {
  border: 5px solid transparent;
  display: inline-flex;
  border-radius: 20px;
  padding: 5px;
  text-align: center;
  width: auto;
  padding: 5px 10px;
  justify-content: center;
  align-items: center;
  font-size: 1.5em;
}

.oval:hover {
  background-color: #f8762b;
  color: white;
  cursor: pointer;
}

.oval.selected {
  border: 1px solid black;
  outline-style: outset;
}
</style>
