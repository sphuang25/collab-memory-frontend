<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { format, formatDistanceToNow } from "date-fns";
import { storeToRefs } from "pinia";
import "primeicons/primeicons.css";
import { computed, onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";
import ArchivePostComponent from "./ArchivePostComponent.vue";
const { isLoggedIn } = storeToRefs(useUserStore());
//npm install primeicons
const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const route = useRoute();
const archiveId = String(route.params.id);
const archive = ref();
const posts = ref();
const loaded = ref(false);
const content = ref("");
const memoryToggle = ref(false);

async function getArchive(id: string) {
  try {
    archive.value = await fetchy(`/api/archives/${id}`, "GET");
  } catch (e) {
    return;
  }
}

async function getArchiveContent(id: string) {
  let contentResult;
  try {
    contentResult = await fetchy(`/api/archives/content/${id}`, "GET");
  } catch (e) {
    return;
  }
  posts.value = contentResult;
}

const emptyForm = () => {
  content.value = "";
};

const toggleMemory = () => {
  memoryToggle.value = !memoryToggle.value;
};

const formatDateDashed = (date: string) => {
  return format(new Date(date), "yyyy-MM-dd"); // Formats as 2024-11-16
};

const formatRelativeTime = (date: string) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true }); // Formats relative time (e.g., '3 days ago')
};

onBeforeMount(async () => {
  await getArchive(archiveId);
  await getArchiveContent(archiveId);
  loaded.value = true;
});
</script>

<template>
  <div v-if="isLoggedIn && loaded" class="folderBody">
    <div id="trapezoid"><h3 class="archiveSideTitle" v-if="!memoryToggle">Archives</h3></div>
    <div class="archiveHeader">
      <div class="archiveTitleDate">
        <div class="titleBackArrow">
          <RouterLink :to="{ name: 'Timeline' }" class="oval" :class="{ clicked: currentRouteName === 'Timeline' || currentRouteName === 'Timeline Content' }"
            ><i class="pi pi-chevron-left backArrow" style="font-size: 2rem"></i
          ></RouterLink>
          <p class="archiveTitle">{{ archive.caption }}</p>
        </div>
        <article class="timestamp">
          <p>by: {{ archive.creator }}</p>
          <p>{{ formatDateDashed(archive.dateCreated) }}</p>
          <p v-if="archive.dateCreated !== archive.dateUpdated">Last Updated: {{ formatRelativeTime(archive.dateUpdated) }}</p>
          <p v-else>Created on: {{ formatDateDashed(archive.dateCreated) }}</p>
        </article>
      </div>
    </div>
    <div class="posts">
      <div class="postGrid" v-if="loaded && posts.length !== 0">
        <article v-for="post in posts" :key="post._id">
          <ArchivePostComponent :post="post" :archive="archive" @refreshPosts="getArchiveContent(archiveId)" />
        </article>
      </div>
    </div>
  </div>
  <p v-else-if="loaded">No posts found</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
.selected-post {
  box-shadow: 0 0 8px 4px #f9dd81;
  border-radius: 10px;
  transition: box-shadow 0.3s ease-in-out;
}

.addMode:hover {
  transform: scale(1.1);
}
.archiveSideTitle {
  color: #3f3f44;
  text-align: center;
}

.folderBody {
  background-color: white;
  width: 100%;
  right: 20px;
  height: calc(100vh - 95px);
  border-radius: 50px 50px 0px 0px;
  position: relative;
  margin-top: 10vh;
}

.archiveTitle {
  font-size: 30px;
  font-weight: lighter;
}
.titleBackArrow {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  width: auto;
  gap: 2em;
  cursor: pointer;
}

.backArrow {
  color: black;
}

/*How to build trapezoid link: https://stackoverflow.com/questions/7920754/how-to-draw-a-trapezium-trapezoid-with-css3*/
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
  z-index: 1;
}
#memoryText {
  font-size: 12px;
  font-weight: bold;
  width: 60px;
  padding: 5px;
}
#plus {
  font-size: 2.5em;
  color: white;
  margin: 0;
  text-align: center;
}

#addMemorySign {
  position: absolute;
  top: 300px;
  left: -25px;
  border-radius: 100px;
  background-color: #3f3f44;
  height: 50px;
  width: 50px;
  z-index: 1;
  cursor: pointer;
  transition:
    transform 0.5s,
    top 0.5s;
}

#addMemorySign.active {
  top: 110px; /* Move 110px upwards */
  transform: rotate(360deg); /* Full spin */
  background-color: #c39d1f;
}

button {
  background: none;
  border: none;
  cursor: pointer;
}

.archiveTitleDate {
  width: 80%;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 5%;
  position: absolute;
  top: 30px;
  left: 10%;
}

.pinnedPost {
  width: 80%;
  border-bottom: 1px solid rgb(220, 220, 220);
  padding: 20px;
  display: flex;
  height: 5%;
  top: 30px;
  margin-top: 5%;
  margin-left: 40px;
}

.archiveHeader {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  width: 100%;
  margin-bottom: 100px;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
  flex-direction: column;
}

.timestamp p {
  font-size: 1em;
  border: 2px solid transparent;
  margin: 0;
}

.posts {
  height: 60vh;
  width: 90%;
  margin-left: 70px;
  margin-top: 20px;
  overflow: scroll;
  z-index: 3;
}

.postGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-left: 20px;
}
.postText {
  width: calc(100% - 40px);
  height: 3vh;
  margin: 10px;
  border-radius: 60px;
  padding: 10px;
  overflow-y: scroll;
  resize: none;
  vertical-align: center;
}

.postBox {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  height: 10vh;
  width: 90%;
  margin-left: 70px;
}
.icons {
  display: flex;
  gap: 0.5em;
}

.textInput::placeholder {
  font-size: 1rem; /* Adjust the size as needed */
  color: #443f43; /* Optional: Change the color for better contrast */
  padding: 2px;
}

.postForm {
  display: flex;
  align-items: center;
  width: 100%;
}
</style>
