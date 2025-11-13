<template>
  <div v-if="currentUser._id" class="min-h-screen bg-gray-200 flex overflow-hidden">
    <!-- Sidebar -->
    <Sidebar :class="{'-ml-[230px]': !sidebarOpened}" class="h-screen flex-shrink-0" />
    <!-- /Sidebar -->

    <!-- Main Content -->
    <div class="flex flex-col flex-1 h-screen">
      <!-- Navbar (Sticky already handled in component) -->
      <Navbar @toggle-sidebar="toggleSidebar" />

      <!-- Scrollable Content Area -->
      <main class="flex-1 overflow-y-auto p-6">
        <router-view></router-view>
      </main>
    </div>
  </div>

  <!-- Loading Spinner -->
  <div v-else class="min-h-full bg-gray-200 flex items-center justify-center">
    <Spinner />
  </div>
</template>


<script setup>
import {ref, onMounted, onUnmounted, computed} from 'vue'
import Sidebar from "./Sidebar.vue";
import Navbar from "./Navbar.vue";
import store from '../store';
import Spinner from './core/Spinner.vue';

const {title} = defineProps({
  title: String
})

const sidebarOpened = ref(true);

const currentUser = computed(() => store.state.user.data );

function toggleSidebar() {
  sidebarOpened.value = !sidebarOpened.value
}

function updateSidebarState() {
  sidebarOpened.value = window.outerWidth > 768;
}

onMounted(() => {
  store.dispatch('getUser')
  updateSidebarState();
  window.addEventListener('resize', updateSidebarState)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSidebarState)
})

</script>

<style scoped>

</style>