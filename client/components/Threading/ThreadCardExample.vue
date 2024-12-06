<script setup lang="ts">
const props = defineProps(["letter"]);
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
      <div class="cardHeader">
        <p class="threadTitle">{{ props.letter }}</p>
      </div>
    </div>
  </div>
  <!-- <div class="base">
      <article class="timestamp">
        <p>{{ formatDateDashed(thread.dateCreated) }}</p>
      </article>
      <p class="author">by: {{ props.thread.creator }}</p>
    </div> -->
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
.editMenu {
  position: absolute;
  top: 15px;
  right: 15px;
  cursor: pointer;
}

.threadTitle {
  font-weight: bold;
  font-size: 10em;
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
  align-items: center;
}

.card:hover {
  filter: brightness(90%);
  cursor: pointer;
  font-size: 1.2em;
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

/* Edit Form Popup */
.editFormPopup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border: 1px solid #ccc;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 20;
  border-radius: 0.5em;
}

/* Menu Box */
.menuBox {
  position: absolute;
  top: 35px;
  right: 10px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 0.5em;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: flex;
  flex-direction: column;
  padding: 5px;
  gap: 5px;
}
</style>
