<script setup lang="ts">
import { format, formatDistanceToNow } from "date-fns";
import router from "@/router";
import EditTimelineForm from "@/components/Timeline/EditTimelineForm.vue";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["archive"]);
const emit = defineEmits(["refreshArchives"]);

const formatDateDashed = (date: string) => {
  return format(new Date(date), "yyyy-MM-dd"); // Formats as 2024-11-16
};

const formatRelativeTime = (date: string) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true }); // Formats relative time (e.g., '3 days ago')
};

// Function to generate a random hex color from palette
const getRandomColor = () => {
  let color = "#";
  const colorPalette: Array<string> = ["F3E8A9", "D4CFBE", "D9D9D9", "D4CDF8"];
  color += colorPalette[Math.floor(Math.random() * colorPalette.length)];
  return color; // Prepend '#' to the color code
};

const randomColor = getRandomColor();

const showMenu = ref(false);
const showEditForm = ref(false);

const toggleArchiveMenu = () => {
  showMenu.value = !showMenu.value; // Toggle menu visibility
};

const toggleEditForm = () => {
  showEditForm.value = !showEditForm.value;
};

const deleteTimelineCard = async () => {
  try {
    await fetchy(`/api/archives/${props.archive._id}`, "DELETE");
    showMenu.value = false; // Hide menu after deletion
    emit("refreshArchives");
  } catch (e) {
    return;
  }
};
</script>

<template>
  <div class="card" :style="{ backgroundColor: randomColor }" @click="router.push(`/archives/${props.archive._id}`)">
    <div class="cardTitle">
      <div id="trapezoid"></div>
      <div class="cardHeader">
        <p class="archiveCaption">{{ props.archive.caption }}</p>
        <div class="clickBox">
          <i class="pi pi-ellipsis-h editMenu" style="font-size: 1.5rem" @click.stop="toggleArchiveMenu"></i>
        </div>
      </div>
      <p>{{ props.archive.content.length }} Memories</p>
    </div>
    <div class="base">
      <!-- Menu Box -->
      <div v-if="showMenu" class="menuBox">
        <button @click.stop="toggleEditForm()">Edit</button>
        <button @click.stop="deleteTimelineCard()">Delete</button>
      </div>
      <!-- Edit Form Popup -->
      <div v-if="showEditForm" class="editFormPopup" @click.stop>
        <EditTimelineForm
          :archive="archive"
          @close="
            showEditForm = false;
            showMenu = false;
          "
          @update="
            showEditForm = false;
            emit('refreshArchives');
            showMenu = false;
          "
        />
      </div>
      <article class="timestamp">
        <p>When: {{ formatDateDashed(archive.timePeriod) }}</p>
        <p v-if="props.archive.dateCreated !== props.archive.dateUpdated">Last Updated: {{ formatRelativeTime(archive.dateUpdated) }}</p>
        <p v-else>Created on: {{ formatDateDashed(props.archive.dateCreated) }}</p>
      </article>
      <p class="author">by: {{ props.archive.creator }}</p>
    </div>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
  color: #3f3f44;
  margin-bottom: 10px;
}

.timestamp p {
  font-size: 1em;
}
.editMenu {
  position: absolute;
  top: 15px;
  right: 15px;
  cursor: pointer;
}

.archiveCaption {
  font-weight: bold;
  font-size: 1.5em;
  margin-bottom: 15px;
}

.cardTitle {
  padding: 10px;
}

.card {
  position: relative;
  height: 100%;
  width: 100%;
  border-radius: 1em;
  padding: 5px;
}

.card:hover {
  filter: brightness(90%);
  cursor: pointer;
}

.author {
  position: absolute;
  bottom: 10px;
  right: 15px;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
  flex-direction: column;
}

.base {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1em;
  padding: 10px;
}

/* Edit Form Popup */
.editFormPopup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border: 1px solid #ccc;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 20;
  border-radius: 0.5em;
}

/* Menu Box */
.menuBox {
  position: absolute;
  top: 35px;
  right: 10px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 0.5em;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: flex;
  flex-direction: column;
  padding: 5px;
  gap: 5px;
}
</style>
