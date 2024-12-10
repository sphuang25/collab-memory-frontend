<script setup lang="ts">
import { useNotificationStore } from "@/stores/notification";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const date = ref("");
const caption = ref("");
const notificationStore = useNotificationStore();
const emit = defineEmits(["cancelArchive", "submitted"]);
const props = defineProps(["selectedPosts"]);

const createArchive = async (posts: Array<string>, timePeriod: string, caption: string) => {
  try {
    await fetchy("/api/archives", "POST", {
      body: { posts, timePeriod, caption },
    });

    notificationStore.triggerTimelineNotification(); //trigger notification after success
  } catch (_) {
    return;
  }
  emptyForm();
};

const emptyForm = () => {
  caption.value = "";
  date.value = "";
  emit("submitted");
};
</script>

<template>
  <form @submit.prevent="createArchive(props.selectedPosts, date, caption)">
    <div class="archiveBox">
      <textarea v-model="caption" placeholder="What is this archive about?" required> </textarea>
      <label id="when" for="start">Date of memory:</label>
      <input v-model="date" type="date" id="start" name="trip-start" value="2024-01-01" min="1900-01-01" max="2030-01-01" />
      <div class="buttonDiv">
        <div class="instructionsBox">
          <p v-if="selectedPosts.length === 0" class="instructions">Select posts from below!</p>
          <p v-else class="instructions">({{ selectedPosts.length }}) selected</p>
          <button class="submit" type="submit">Save</button>
          <button class="cancel" @click="emit('cancelArchive')">Cancel</button>
        </div>
      </div>
    </div>
  </form>
</template>

<style scoped>
.instructions {
  font-size: 12px;
  color: #c39d1f;
}
textarea {
  border: none;
  border-bottom: 1px solid black;
  width: 150%;
  height: 30%;
  margin: 10px;
  font-size: 20px;
}
#when {
  font-size: 18px;
  color: rgb(130, 130, 130);
}
textarea::placeholder {
  font-size: 30px;
  color: rgb(130, 130, 130);
}

.buttonDiv {
  display: flex;
  gap: 1em;
  height: 120%;
  width: 75%;
}
.archiveBox {
  height: auto;
  background-color: white;
  width: 75vw;
  height: 12vh;
  position: relative;
  border-bottom: 1px solid #ececec;
  right: 320px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 2em;
}

.submit {
  background-color: #c39d1f;
  border-radius: 10px;
  width: 69px;
  height: 30px;
  color: white;
  border: none;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.cancel {
  color: #c39d1f;
  border: none;
  font-size: 16px;
  width: 69px;
  height: 30px;
  background-color: white;
  font-weight: bold;
  cursor: pointer;
}
</style>
