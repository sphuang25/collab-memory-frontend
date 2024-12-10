import { defineStore } from "pinia";
import { ref } from "vue";

export const useNotificationStore = defineStore("notification", () => {
  const showTimelineNotification = ref(false);

  const triggerTimelineNotification = () => {
    showTimelineNotification.value = true;
  };

  const hideTimelineNotification = () => {
    showTimelineNotification.value = false;
  };

  return {
    showTimelineNotification,
    triggerTimelineNotification,
    hideTimelineNotification,
  };
});
