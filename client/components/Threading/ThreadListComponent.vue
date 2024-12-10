<script setup lang="ts">
import CreateThreadForm from "@/components/Threading/CreateThreadForm.vue";
import ThreadCard from "@/components/Threading/ThreadCard.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { isLoggedIn } = storeToRefs(useUserStore());
const props = defineProps(["familyID"]);
const loaded = ref(false);
let threads = ref();

async function getThreads() {
  let threadResults;
  try {
    threadResults = await fetchy(`/api/threads/${props.familyID}`, "GET");
  } catch (_) {
    return;
  }
  threads.value = threadResults;
}

onBeforeMount(async () => {
  await getThreads();
  loaded.value = true;
});
</script>

<template>
  <div v-if="isLoggedIn" class="folderBody">
    <!-- <div id="trapezoid"><h3 class="threadSideTitle">Threads</h3></div> -->
    <h3 class="threadMainTitle">All Active Threads</h3>
    <section class="threads" v-if="loaded">
      <CreateThreadForm :familyID="props.familyID" @refreshThreads="getThreads" />
      <article v-for="thread in threads" :key="thread._id">
        <ThreadCard :thread="thread" @refreshThreads="getThreads" />
      </article>
    </section>
    <p v-if="loaded && threads.length == 0" class="threadMainTitle">No threads found</p>
    <p v-else-if="!loaded" class="threadMainTitle">Loading...</p>
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
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

.threadSideTitle {
  color: #3f3f44;
  text-align: center;
}

.threadMainTitle {
  color: #3f3f44;
  text-align: center;
  font-size: 30px;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  width: calc(33.33% - 1em);
  box-sizing: border-box;
  max-width: 30%;
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
  overflow-y: scroll;
  top: -75px;
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
}

.threads {
  padding: 1em;
  overflow-y: scroll;
  height: 100%;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
