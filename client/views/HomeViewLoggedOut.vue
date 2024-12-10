<script setup lang="ts">
import ThreadCardExample from "@/components/Threading/ThreadCardExample.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { isLoggedIn } = storeToRefs(useUserStore());
const letters = ["F", "A", "M", ".", "L", "Y"];
</script>

<template>
  <div class="folderBody">
    <!-- <div id="trapezoid"><h3 class="threadSideTitle">Threads</h3></div> -->
    <h3 class="threadMainTitle">Strengthen your connections with discovering more about your family!</h3>
    <h5 class="threadMainTitle">Communicate and Learn More About your Family within Threads. Archive Noteable Messages and Memories in your Timeliine</h5>
    <section class="threads">
      <article><ThreadCardExample :letter="letters[0]" /></article>
      <article><ThreadCardExample :letter="letters[1]" /></article>
      <article><ThreadCardExample :letter="letters[2]" /></article>
      <article><ThreadCardExample :letter="letters[3]" /></article>
      <article><ThreadCardExample :letter="letters[4]" /></article>
      <article><ThreadCardExample :letter="letters[5]" /></article>
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

.threads {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
