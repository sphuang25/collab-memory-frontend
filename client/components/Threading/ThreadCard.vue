<script setup lang="ts">
const props = defineProps(["thread"]);
const emit = defineEmits(["refreshThreads"]);
//
import { format, formatDistanceToNow } from "date-fns";

const formatDateDashed = (date: string) => {
  return format(new Date(date), "yyyy-MM-dd"); // Formats as 2024-11-16
};

const formatRelativeTime = (date: string) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true }); // Formats relative time (e.g., '3 days ago')
};

// Function to generate a random hex color from palette
const getRandomColor = () => {
  let color = "#";
  const colorPalette: Array<string> = ["F3E8A9", "D4CFBE", "D9D9D9", "D4CDF8"];
  color += colorPalette[Math.floor(Math.random() * colorPalette.length)];
  return color; // Prepend '#' to the color code
};

const randomColor = getRandomColor();
</script>

<template>
  <div class="card" :style="{ backgroundColor: randomColor }">
    <div class="cardTitle">
      <p class="threadTitle">{{ props.thread.title }}</p>
      <p>{{ props.thread.content.length }} Discussions</p>
    </div>
    <div class="base">
      <article class="timestamp">
        <p>{{ formatDateDashed(thread.dateCreated) }}</p>
        <p v-if="props.thread.dateCreated !== props.thread.dateUpdated">Last Updated: {{ formatRelativeTime(thread.dateUpdated) }}</p>
        <p v-else>Created on: {{ formatDateDashed(props.thread.dateCreated) }}</p>
      </article>
      <p class="author">by: {{ props.thread.creator }}</p>
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

.card {
  position: relative;
  height: 100%;
  width: 100%;
  border-radius: 1em;
  padding: 5px;
}

.author {
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
}
</style>
