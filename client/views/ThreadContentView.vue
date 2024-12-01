<script setup lang="ts">
import ThreadContentPage from "@/components/Threading/ThreadContentPage.vue";
import { useRoute } from "vue-router";
const route = useRoute();
</script>

<template>
  <main>
    <ThreadContentPage :thread="{ id: route.params.id }" />
  </main>
</template>
