<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { format } from "date-fns";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";
const props = defineProps(["invite"]);
const emit = defineEmits(["refreshInvites", "refreshFamilies"]);
const { currentUsername } = storeToRefs(useUserStore());

const fromUsername = ref("");
const familyName = ref("");

const formatDateDashed = (date: string) => {
  return format(new Date(date), "yyyy-MM-dd"); // Formats as 2024-11-16
};

const getFromUser = async () => {
  try {
    const user = await fetchy(`/api/users/user/${props.invite.fromID}`, "GET");
    fromUsername.value = user.username;
  } catch {
    return;
  }
};

const getFamilyTitle = async () => {
  try {
    familyName.value = await fetchy(`/api/family/name/${props.invite.familyID}`, "GET");
  } catch {
    return;
  }
};

const acceptFamilyInvite = async () => {
  try {
    await fetchy(`/api/family/invite/accept/${props.invite.familyID}`, "PATCH");
  } catch {
    return;
  }
  emit("refreshFamilies");
  emit("refreshInvites");
};

const rejectFamilyInvite = async () => {
  try {
    await fetchy(`/api/family/invite/reject/${props.invite.familyID}`, "PATCH");
  } catch {
    return;
  }
  emit("refreshInvites");
};

onBeforeMount(async () => {
  await getFromUser();
  await getFamilyTitle();
});
</script>

<template>
  <p class="sender">{{ familyName }}</p>
  <div class="base">
    <article class="timestamp">
      <p>Invitation From: {{ fromUsername }}</p>
    </article>
    <article class="timestamp">
      <p>Invited at: {{ formatDateDashed(props.invite.dateCreated) }}</p>
    </article>
    <p class="button"><button class="button-error btn-small pure-button" @click="rejectFamilyInvite">Reject</button></p>
    <p class="button"><button class="btn-small pure-button" @click="acceptFamilyInvite">Accept</button></p>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.button {
  right: 100%;
}

.sender {
  font-weight: bold;
  font-size: 1.2em;
  padding: 1em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: column;
  align-items: end;
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
  flex-direction: column;
}

.base article:only-child {
  margin-left: auto;
}
</style>
