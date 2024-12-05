<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";
import { fetchy } from "@/utils/fetchy";
import { format, formatDistanceToNow } from "date-fns";
import PostComponent from "@/components/Post/PostComponent.vue";
import CreateArchiveForm from "@/components/Archiving/CreateArchiveForm.vue";
const { isLoggedIn } = storeToRefs(useUserStore());
import { useRoute } from "vue-router";
import "primeicons/primeicons.css";
//npm install primeicons
const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const route = useRoute();
const threadId = String(route.params.id);
const thread = ref();
const posts = ref();
const loaded = ref(false);
const content = ref("");
const contentType = ref("");
const memoryToggle = ref(false);
const selectedPosts = ref<string[]>([]);
async function getThread(id: string) {
  let threadResult;
  try {
    threadResult = await fetchy(`/api/thread/${id}`, "GET");
  } catch (e) {
    return;
  }
  thread.value = threadResult;
}

async function getThreadContent(id: string) {
  let contentResult;
  try {
    contentResult = await fetchy(`/api/threads/${id}`, "GET");
  } catch (e) {
    return;
  }
  posts.value = contentResult;
}

async function makePost(content: string) {
  const id = threadId;
  try {
    await fetchy("/api/posts", "POST", {
      body: { content, id, contentType: contentType.value },
    });
  } catch (_) {
    return;
  }
  await getThreadContent(id);
  emptyForm();
}

const emptyForm = () => {
  content.value = "";
};

const clearSelectedPosts = () => {
  selectedPosts.value = [];
  toggleMemory();
};

const toggleMemory = () => {
  memoryToggle.value = !memoryToggle.value;
};

const togglePostSelection = (postId: string) => {
  console.log(selectedPosts.value, "id", postId);
  if (selectedPosts.value.includes(postId)) {
    console.log("remove");
    selectedPosts.value = selectedPosts.value.filter((id) => id !== postId);
  } else {
    console.log("add");
    selectedPosts.value.push(postId);
  }
};

const setContentType = (type: string) => {
  contentType.value = type;
};

const formatDateDashed = (date: string) => {
  return format(new Date(date), "yyyy-MM-dd"); // Formats as 2024-11-16
};

const formatRelativeTime = (date: string) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true }); // Formats relative time (e.g., '3 days ago')
};

onBeforeMount(async () => {
  await getThread(threadId);
  await getThreadContent(threadId);
  loaded.value = true;
});
</script>

<template>
  <div v-if="isLoggedIn && loaded" class="folderBody">
    <div id="trapezoid"><h3 class="threadSideTitle" v-if="!memoryToggle">Threads</h3></div>
    <div id="addMemorySign" :class="{ active: memoryToggle }" @click="toggleMemory()">
      <p id="plus">+</p>
      <p id="memoryText" v-if="!memoryToggle">Make a memory</p>
    </div>
    <div class="threadHeader">
      <div class="threadTitleDate">
        <div class="titleBackArrow">
          <RouterLink :to="{ name: 'Threads' }" class="oval" :class="{ clicked: currentRouteName === 'Threads' || currentRouteName === 'Thread Content' }"
            ><i class="pi pi-chevron-left backArrow" style="font-size: 2rem"></i
          ></RouterLink>
          <p class="threadTitle">{{ thread.title }}</p>
          <CreateArchiveForm v-if="memoryToggle" :selectedPosts="selectedPosts" @cancelArchive="toggleMemory" @submitted="clearSelectedPosts"></CreateArchiveForm>
        </div>
        <article class="timestamp">
          <p>by: {{ thread.creator }}</p>
          <p>{{ formatDateDashed(thread.dateCreated) }}</p>
          <p v-if="thread.dateCreated !== thread.dateUpdated">Last Updated: {{ formatRelativeTime(thread.dateUpdated) }}</p>
          <p v-else>Created on: {{ formatDateDashed(thread.dateCreated) }}</p>
        </article>
      </div>
      <div class="pinnedPost"></div>
    </div>
    <div class="posts">
      <div class="postGrid" v-if="loaded && posts.length !== 0">
        <article v-for="post in posts" :key="post._id">
          <PostComponent :post="post" @refreshPosts="getThreadContent" v-if="!memoryToggle" />
          <PostComponent class="addMode" :post="post" @refreshPosts="getThreadContent" @click="togglePostSelection(post._id)" v-else :class="{ 'selected-post': selectedPosts.includes(post._id) }" />
        </article>
      </div>
    </div>
    <div class="postBox">
      <form @submit.prevent="makePost(content)" class="postForm">
        <textarea class="textInput postText" v-model="content" placeholder="Contribute to thread"></textarea>
        <div class="icons">
          <button type="submit" aria-label="Enter Text" @click="setContentType('text')"><i class="pi pi-arrow-circle-up" style="font-size: 2rem"></i></button>
          <button type="submit" aria-label="Record Audio"><i class="pi pi-microphone" style="font-size: 2rem"></i></button>
          <button type="submit" aria-label="Post Image"><i class="pi pi-image" style="font-size: 2rem"></i></button>
        </div>
      </form>
    </div>
  </div>
  <p v-else-if="loaded" class="threadMainTitle">No threads found</p>
  <p v-else class="threadMainTitle">Loading...</p>
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
.threadSideTitle {
  color: #3f3f44;
  text-align: center;
}

.threadMainTitle {
  color: #3f3f44;
  text-align: center;
  font-size: 30px;
  margin-top: 100px;
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

.threadTitle {
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

.threadTitleDate {
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

.threadHeader {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  width: 100%;
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
