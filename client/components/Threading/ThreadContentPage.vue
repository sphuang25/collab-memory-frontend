<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "@/utils/fetchy";
import { format, formatDistanceToNow } from "date-fns";
import PostComponent from "@/components/Post/PostComponent.vue";
const { isLoggedIn } = storeToRefs(useUserStore());
import { useRoute } from "vue-router";
import "primeicons/primeicons.css";
//npm install primeicons

const route = useRoute();
const threadId = route.params.id;
const thread: ThreadDoc = ref();
const posts = ref();
const loaded = ref(false);
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
  console.log(contentResult);
}
//let editing = ref("");
//let searchAuthor = ref("");
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
    <div id="trapezoid"><h3 class="threadSideTitle">Threads</h3></div>
    <div class="threadHeader">
      <div class="threadTitleDate">
        <p class="threadTitle">{{ thread.title }}</p>
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
      <div v-if="loaded && posts.length !== 0">
        <article v-for="post in posts" :key="post._id">
          <PostComponent :post="post" />
        </article>
      </div>
    </div>
    <div class="postBox">
      <form @submit.prevent="makePost()" class="postForm">
        <div class="postText">
          <textarea class="textInput" placeholder="Contribute to thread"></textarea>
        </div>
        <button type="submit">Post</button>
      </form>
      <div class="icons">
        <i class="pi pi-microphone" style="font-size: 2rem"></i>
        <i class="pi pi-image" style="font-size: 2rem"></i>
      </div>
    </div>
  </div>
</template>

<style scoped>
.threadSideTitle {
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

.threadTitle {
  font-size: 30px;
  font-weight: lighter;
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
  border: 2px solid black;
  overflow: scroll;
  z-index: 3;
}

.postText {
  width: 60vw;
  border: 2px solid blue;
  margin: 10px;
  border-radius: 60px;
  flex-grow: 1;
}

.postBox {
  display: flex;
  align-items: center;
  height: 10vh;
  width: 90%;
  margin-left: 70px;
  border: 2px solid red;
}
.icons {
  display: flex;
  gap: 1em;
}

.postForm {
  display: flex;
  align-items: center;
  width: 80%; /* Adjust width to control form size */
}
</style>
