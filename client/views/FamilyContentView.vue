<script setup lang="ts">
import FamilyContentPage from "@/components/Family/FamilyContentPage.vue";
import { useRoute } from "vue-router";
const route = useRoute();
</script>

<template>
  <main>
    <FamilyContentPage :family="{ id: route.params.id }" />
  </main>
</template>
