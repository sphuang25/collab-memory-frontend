<script setup lang="ts">
const props = defineProps(["post"]);
const emit = defineEmits(["close", "update", "refreshPosts"]);
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const updatedContent = ref(props.post.content);

const submitEdit = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "PATCH", { body: { content: updatedContent.value } });
  } catch (e) {
    return;
  }
  emit("update"); // Notify parent about the update
  emit("close"); // Close the form
  emit("refreshPosts", props.post.thread);
};

const cancelEdit = () => {
  emit("close"); // Close the form
};
</script>

<template>
  <div class="editBox">
    <textarea v-model="updatedContent" rows="4" cols="50"></textarea>
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
