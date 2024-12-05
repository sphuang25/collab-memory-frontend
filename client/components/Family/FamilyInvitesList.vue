<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import FamilyInviteForm from "./FamilyInviteForm.vue";
import FamilySentInviteCard from "./FamilySentInviteCard.vue";
const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const props = defineProps(["familyID"]);
const loaded = ref(false);
let invites = ref<Array<Record<string, string>>>([]);

const getInvites = async () => {
  try {
    invites.value = await fetchy(`/api/family/invite/${props.familyID}`, "GET");
  } catch {
    return;
  }
};

onBeforeMount(async () => {
  await getInvites();
  loaded.value = true;
});
</script>

<template>
  <section>
    <FamilyInviteForm :familyID="familyID" @refreshInvites="getInvites" />
  </section>

  <section v-if="invites.length !== 0">
    <article v-for="invite in invites" :key="invite._id">
      <FamilySentInviteCard :invite="invite" @refreshInvites="getInvites" />
    </article>
  </section>
</template>

<style scoped>
section {
  align-items: center;
  align-content: center;
  padding: 1em;
  row-gap: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 2em;
  border: 1px solid black;
  outline-style: outset;
}

.posts {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
