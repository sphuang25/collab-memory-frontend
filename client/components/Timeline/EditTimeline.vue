<script setup lang="ts">
const props = defineProps(["thread"]);
const emit = defineEmits(["close", "update", "refreshThreads"]);
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const updatedTitle = ref(props.thread.title);

const submitEdit = async () => {
  try {
    await fetchy(`/api/threads/${props.thread._id}`, "PATCH", { body: { title: updatedTitle.value } });
  } catch (e) {
    return;
  }
  emit("update"); // Notify parent about the update
  emit("refreshThreads");
};

const cancelEdit = () => {
  emit("close"); // Close the form
};
</script>

<template>
  <div class="editBox">
    <textarea v-model="updatedTitle" rows="4" cols="50"></textarea>
    <div class="selectButtons">
      <button @click="submitEdit()">Save</button>
      <button @click="cancelEdit()">Cancel</button>
    </div>
  </div>
</template>

<style scoped>
.editBox {
  width: 200px;
}

.selectButtons {
  display: flex;
  justify-content: center;
}
textarea {
  width: 100%;
  padding: 5px;
  margin-bottom: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  margin-right: 5px;
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
}
</style>
