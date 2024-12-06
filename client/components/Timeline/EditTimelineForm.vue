<script setup lang="ts">
const props = defineProps(["archive"]);
const emit = defineEmits(["close", "update", "refreshArchives"]);
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const updatedCaption = ref(props.archive.caption);

const submitEdit = async () => {
  let edit;
  try {
    edit = await fetchy(`/api/archives/${props.archive._id}`, "PATCH", { body: { caption: updatedCaption.value } });
  } catch (e) {
    return;
  }
  console.log(edit);
  emit("update"); // Notify parent about the update
  emit("refreshArchives");
};

const cancelEdit = () => {
  emit("close"); // Close the form
};
</script>

<template>
  <div class="editBox">
    <textarea v-model="updatedCaption" rows="4" cols="50"></textarea>
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
