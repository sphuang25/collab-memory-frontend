<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { fetchy } from "../../utils/fetchy";
const props = defineProps(["member"]);
const emit = defineEmits(["refreshMembers"]);
const { currentUsername } = storeToRefs(useUserStore());

const friendInterface = ref("");

const removeMember = async () => {
  try {
    await fetchy(`/api/friends/${props.member.userID}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshMembers");
};

onMounted(async () => {});
</script>

<template>
  <p class="sender">{{ props.member.userID }}</p>
  <p>h</p>
  <!-- <p>Interface: {{ friendInterface }}</p>
  <div class="base">
    <article class="timestamp">
      <p>Friends since: {{ formatDate(props.friend.dateCreated) }}</p>
    </article>
    <menu>
      <p><button class="btn-small pure-button" @click="removeMember">Remove</button></p>
    </menu>
  </div> -->
</template>

<style scoped>
p {
  margin: 0em;
}

.sender {
  font-weight: bold;
  font-size: 1.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 1;
  margin: 0;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}
</style>
