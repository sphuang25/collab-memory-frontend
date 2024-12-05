<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import TimelineFolder from "@/components/Timeline/TimelineFolder.vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let archives = ref();

async function getArchives() {
  let archiveResults;
  try {
    archiveResults = await fetchy("/api/archives", "GET");
    console.log(archiveResults);
  } catch (_) {
    return;
  }
  archives.value = archiveResults;
}

onBeforeMount(async () => {
  await getArchives();
  loaded.value = true;
});
</script>

<template>
  <div v-if="isLoggedIn" class="folderBody">
    <div id="trapezoid"><h3 class="archiveSideTitle">Archives</h3></div>
    <h3 class="archiveMainTitle">Family Archives</h3>
    <section class="archives" v-if="loaded">
      <article v-for="archive in archives" :key="archive._id">
        <TimelineFolder :archive="archive" @refreshArchives="getArchives" />
      </article>
    </section>
    <p v-if="loaded && archives.length == 0" class="archiveMainTitle">No threads found</p>
    <p v-else-if="!loaded" class="archiveMainTitle">Loading...</p>
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

.archiveSideTitle {
  color: #3f3f44;
  text-align: center;
}

.archiveMainTitle {
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
  width: 95%;
  height: calc(100vh - 95px);
  margin-right: 40px;
  border-radius: 50px 50px 0px 0px;
  position: relative;
  margin-top: 10vh;
  padding: 10px;
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

.archives {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
