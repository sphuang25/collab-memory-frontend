<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount } from "vue";
import { RouterView, useRoute } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { currentUsername, isLoggedIn } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());

// Make sure to update the session before mounting the app in case the user is already logged in
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
          <li>
            <RouterLink v-if="isLoggedIn" :to="{ name: 'Profile' }" class="oval" :class="{ clicked: currentRouteName === 'Profile' }">Profile</RouterLink>
          </li>
          <li v-if="isLoggedIn">
            <RouterLink :to="{ name: 'Threads' }" class="oval" :class="{ clicked: currentRouteName === 'Threads' || currentRouteName === 'Thread Content' }">Threads</RouterLink>
          </li>
          <li v-if="isLoggedIn">
            <RouterLink v-if="isLoggedIn" :to="{ name: 'Timeline' }" class="oval" :class="{ clicked: currentRouteName === 'Timeline' }">Timeline</RouterLink>
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
          <span v-if="isLoggedIn"> Welcome, {{ currentUsername }} </span>
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
</style>
