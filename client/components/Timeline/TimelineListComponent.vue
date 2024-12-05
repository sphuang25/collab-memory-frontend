<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let threads = ref();
//let editing = ref("");
//let searchAuthor = ref("");

async function getThreads() {
  let threadResults;
  try {
    threadResults = await fetchy("/api/threads", "GET");
  } catch (_) {
    return;
  }
  threads.value = threadResults;
}

/*function updateEditing(id: string) {
  editing.value = id;
}*/

onBeforeMount(async () => {
  await getThreads();
  loaded.value = true;
});
</script>

<template>
  <div v-if="isLoggedIn" class="folderBody">
    <div id="trapezoid"><h3 class="threadSideTitle">Timeline</h3></div>
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
</style>
