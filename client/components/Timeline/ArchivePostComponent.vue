<script setup lang="ts">
const props = defineProps(["post", "archive"]);
import { format } from "date-fns";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const showMenu = ref(false);
const emit = defineEmits(["refreshPosts"]);

const formatDateDashed = (date: string) => {
  return format(new Date(date), "yyyy-MM-dd"); // Formats as 2024-11-16
};

const toggleMenu = () => {
  showMenu.value = !showMenu.value; // Toggle menu visibility
};

const deletePostFromArchive = async () => {
  try {
    await fetchy(`/api/archives/${props.archive._id}/post/${props.post._id}`, "DELETE");
    showMenu.value = false; // Hide menu after deletion
    emit("refreshPosts");
  } catch (e) {
    return;
  }
};
</script>

<template>
  <!-- Post Details -->
  <div class="card">
    <div class="base">
      <i class="pi pi-ellipsis-h editMenu" style="font-size: 1.5rem" @click="toggleMenu"></i>
      <!-- Menu Box -->
      <div v-if="showMenu" class="menuBox">
        <button @click="deletePostFromArchive()">Remove</button>
      </div>
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
</style>
