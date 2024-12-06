<script setup lang="ts">
import TimelineContentPage from "@/components/Timeline/TimelineContentPage.vue";
import { useRoute } from "vue-router";
const route = useRoute();
</script>

<template>
  <main>
    <TimelineContentPage :archive="{ id: route.params.id }" />
  </main>
</template>
