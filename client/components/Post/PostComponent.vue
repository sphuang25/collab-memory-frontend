<script setup lang="ts">
const props = defineProps(["post"]);
import { format } from "date-fns";
import { ref } from "vue";
const showMenu = ref(false);

const formatDateDashed = (date: string) => {
  return format(new Date(date), "yyyy-MM-dd"); // Formats as 2024-11-16
};

const toggleMenu = () => {
  showMenu.value = !showMenu.value; // Toggle form visibility
};
</script>

<template>
  <div class="card">
    <div class="base">
      <i class="pi pi-ellipsis-h editMenu" style="font-size: 1.5rem" @click="toggleMenu"></i>
      <div v-if="showMenu" class="menuBox"></div>
      <p class="postContent">{{ props.post.content }}</p>
      <p class="author">by: {{ props.post.author }}</p>
      <p class="date">{{ formatDateDashed(props.post.dateCreated) }}</p>
    </div>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
  color: #3f3f44;
  margin-bottom: 10px;
}
.timestamp p {
  font-size: 1em;
}

.threadTitle {
  font-weight: bold;
  font-size: 1.5em;
  margin-bottom: 15px;
}

.cardTitle {
  padding: 10px;
}
.author {
  position: absolute;
  bottom: 10px;
  left: 15px;
}

.editMenu {
  position: absolute;
  top: 15px;
  right: 15px;
  cursor: pointer;
}
.card {
  position: relative;
  height: 25vh;
  width: 20vw;
  margin: 10px;
  border-radius: 1em;
  padding: 5px;
  background-color: #d4cdf8;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.postContent {
  font-size: 18px;
  position: absolute;
  top: 50px;
}
.date {
  position: absolute;
  bottom: 10px;
  right: 15px;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
  flex-direction: column;
}

.base {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1em;
  padding: 10px;
  overflow-y: scroll;
}
</style>
