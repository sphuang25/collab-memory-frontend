<script setup lang="ts">
import { useNotificationStore } from "@/stores/notification";
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { currentUsername, isLoggedIn } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());

const notificationStore = useNotificationStore();
// Convert to refs for easy usage
const { showTimelineNotification } = storeToRefs(notificationStore);

// // Control the visibility of the timeline notification indicator
// const showTimelineNotification = ref(false);

// // Example: trigger the notification after 2 seconds
// setTimeout(() => {
//   showTimelineNotification.value = true;
//   setTimeout(() => {
//     showTimelineNotification.value = false;
//   }, 3000);
// }, 2000);

onBeforeMount(async () => {
  try {
    await userStore.updateSession();
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <header>
    <div class="wrapper">
      <div class="sidebar">
        <RouterLink :to="{ name: 'Home' }"><h2 class="appTitle">fam.ly</h2></RouterLink>
        <ul>
          <li>
            <RouterLink v-if="!isLoggedIn" :to="{ name: 'Login' }" class="oval">Login</RouterLink>
          </li>
          <li>
            <RouterLink v-if="isLoggedIn" :to="{ name: 'Home' }" class="oval" :class="{ clicked: currentRouteName === 'Home' }">Home</RouterLink>
          </li>
          <li v-if="isLoggedIn">
            <RouterLink :to="{ name: 'Threads' }" class="oval" :class="{ clicked: currentRouteName === 'Threads' || currentRouteName === 'Thread Content' }">Threads</RouterLink>
          </li>
          <li v-if="isLoggedIn">
            <RouterLink
              :to="{ name: 'Timeline' }"
              class="oval"
              :class="{ clicked: currentRouteName === 'Timeline' || currentRouteName === ' Timeline Content' }"
              @click="notificationStore.hideTimelineNotification()"
            >
              Timeline
              <span v-if="showTimelineNotification" class="notification-circle"></span>
            </RouterLink>
          </li>
          <div class="bottom">
            <li>
              <RouterLink v-if="isLoggedIn" :to="{ name: 'Settings' }" class="oval" :class="{ clicked: currentRouteName === 'Settings' }">Settings</RouterLink>
            </li>
          </div>
        </ul>
      </div>
      <div class="content">
        <div class="userProfile">
          <RouterLink v-if="isLoggedIn" :to="{ name: 'Profile' }" class="welcome-link">View Profile</RouterLink>
        </div>
        <article v-if="toast !== null" class="toast" :class="toast.style">
          <p>{{ toast.message }}</p>
        </article>
        <RouterView />
      </div>
    </div>
  </header>
</template>

<style scoped>
@import "./assets/toast.css";
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  list-style: none;
  text-decoration: none;
  font-family: "Josefin Sans", sans-serif;
}

.appTitle {
  font-size: 2.5em;
}

.wrapper {
  display: flex;
  position: relative;
}
.wrapper .content {
  margin-left: 200px;
  padding: 20px;
  width: calc(100% - 200px);
  background-color: #ececec;
  height: 100vh;
}

.wrapper .sidebar {
  width: 200px;
  height: 100%;
  background: #ececec;
  padding: 30px 0;
  position: fixed;
}

.wrapper .sidebar h2 {
  color: #3f3f44;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 30px;
}

.clicked {
  background-color: #d52a26;
  color: white !important;
}

.wrapper .sidebar ul li {
  padding: 5px;
  margin-right: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.wrapper .sidebar ul li a {
  color: #3f3f44;
  font-weight: bold;
  display: flex;
  font-size: 16px;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.wrapper .sidebar ul li a {
  width: 60px;
}

.oval {
  border: 5px solid transparent;
  display: inline-flex;
  border-radius: 20px;
  padding: 5px;
  text-align: center;
  width: auto;
  min-width: 120px;
  padding: 5px 10px;
  justify-content: center;
  align-items: center;
}

.oval:hover {
  background-color: #d52a26;
}

.wrapper .sidebar ul li a:hover {
  color: #fff;
}

.bottom {
  align-items: flex-end;
}

.userProfile {
  position: fixed;
  top: 10px;
  padding: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  font-size: 20px;
  color: #3f3f44;
}

.welcome-link {
  display: inline-block;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background-color: #6cae75;
  border-radius: 8px;
  text-align: center;
  text-decoration: none;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.welcome-link:hover {
  background-color: #558b5a;
}

/* Notification circle style */
.notification-circle {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-left: 8px;
  background-color: red;
  border-radius: 50%;
  vertical-align: middle;
}
</style>
