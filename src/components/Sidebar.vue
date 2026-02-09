<script setup>
import {
  HomeIcon,
  UsersIcon,
  ListBulletIcon,
  ChartBarIcon,
  TagIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ShoppingBagIcon,
  ArchiveBoxIcon,
  ArchiveBoxArrowDownIcon,
  ComputerDesktopIcon,
} from "@heroicons/vue/24/solid";
import { ref } from "vue";

const openSettings = ref(false);
</script>

<template>
  <div
    class="w-[230px] h-screen overflow-y-auto transition-all bg-[#986b41] text-white py-4 px-2"
  >
    <router-link
      :to="{ name: 'app.dashboard' }"
      class="flex items-center justify-center p-2 rounded transition-colors"
    >
      <img src="../assets/pos-logo.png" alt="Logo" class="w-50 h-50" />
    </router-link>

    <router-link
      :to="{ name: 'app.dashboard' }"
      class="flex items-center p-2 rounded transition-colors hover:bg-black/30"
    >
      <span class="mr-2 text-gray-300">
        <HomeIcon class="w-5" />
      </span>
      <span class="text-xs">{{ $t('MENU.dashboard') }}</span>
    </router-link>
    <!-- target="_blank" -->
    <router-link
      :to="{ name: 'app.pos' }"
      class="flex items-center p-2 rounded transition-colors hover:bg-black/30"
    >
      <span class="mr-2 text-gray-300">
        <ComputerDesktopIcon class="w-5" />
      </span>
      <span class="text-xs">{{ $t('MENU.pos') }}</span>
    </router-link>

    <!-- <router-link
      :to="{ name: 'app.categories' }"
      class="flex items-center p-2 rounded transition-colors hover:bg-black/30"
    >
      <span class="mr-2 text-gray-300">
        <TagIcon class="w-5" />
      </span>
      <span class="text-xs">Categories</span>
    </router-link> -->

    <router-link
      :to="{ name: 'app.order' }"
      class="flex items-center p-2 rounded transition-colors hover:bg-black/30"
    >
      <span class="mr-2 text-gray-300">
        <ShoppingBagIcon class="w-5" />
      </span>
      <span class="text-xs">{{ $t('MENU.order') }}</span>
    </router-link>

    <router-link
      :to="{ name: 'app.stockin' }"
      class="flex items-center p-2 rounded transition-colors hover:bg-black/30"
    >
      <span class="mr-2 text-gray-300">
        <ArchiveBoxArrowDownIcon class="w-5" />
      </span>
      <span class="text-xs">{{ $t('MENU.stock_in') }}</span>
    </router-link>

    <router-link
      :to="{ name: 'app.product' }"
      class="flex items-center p-2 rounded transition-colors hover:bg-black/30"
    >
      <span class="mr-2 text-gray-300">
        <ArchiveBoxIcon class="w-5" />
      </span>
      <span class="text-xs">{{ $t('MENU.product') }}</span>
    </router-link>

    <!-- <router-link
      :to="{ name: 'app.users' }"
      class="flex items-center p-2 rounded transition-colors hover:bg-black/30"
    >
      <span class="mr-2 text-gray-300">
        <UsersIcon class="w-5" />
      </span>
      <span class="text-xs">Users</span>
    </router-link> -->

    <router-link
      :to="{ name: 'app.dashboard' }"
      class="flex items-center p-2 rounded transition-colors hover:bg-black/30"
    >
      <span class="mr-2 text-gray-300">
        <ChartBarIcon class="w-5" />
      </span>
      <span class="text-xs">{{ $t('MENU.report') }}</span>
    </router-link>

    <!-- Settings -->
    <button
      @click="openSettings = !openSettings"
      class="flex w-full items-center p-2 rounded hover:bg-black/30 transition-colors"
    >
      <Cog6ToothIcon class="w-5 mr-2 text-gray-300" />
      <span class="text-xs">{{ $t('MENU.setting') }}</span>

      <ChevronDownIcon
        class="w-5 ml-auto mr-2 transition-transform"
        :class="{ 'rotate-180': openSettings }"
      />
    </button>

    <div v-if="openSettings" class="mt-1">
      <router-link
        :to="{ name: 'app.woodtype' }"
        class="flex items-center ml-6 p-2 rounded hover:bg-black/20 text-xs cursor-pointer"
      >
        <span class="mr-2 text-gray-300">
          <ListBulletIcon class="w-5" />
        </span>
        <span class="text-xs">{{ $t('MENU.wood_type') }}</span>
      </router-link>
      <router-link
        :to="{ name: 'app.woodgrain' }"
        class="flex items-center ml-6 p-2 rounded hover:bg-black/20 text-xs cursor-pointer"
      >
        <span class="mr-2 text-gray-300">
          <ListBulletIcon class="w-5" />
        </span>
        <span class="text-xs">{{ $t('MENU.wood_grain') }}</span>
      </router-link>

      <router-link
        :to="{ name: 'app.woodlength' }"
        class="flex items-center ml-6 p-2 rounded hover:bg-black/20 text-xs cursor-pointer"
      >
        <span class="mr-2 text-gray-300">
          <ListBulletIcon class="w-5" />
        </span>
        <span class="text-xs">{{ $t('MENU.wood_length') }}</span>
      </router-link>

      <router-link
        :to="{ name: 'app.users' }"
        class="flex items-center ml-6 p-2 rounded hover:bg-black/20 text-xs cursor-pointer"
      >
        <span class="mr-2 text-gray-300">
          <UsersIcon class="w-5" />
        </span>
        <span class="text-xs">{{ $t('MENU.user') }}</span>
      </router-link>
    </div>
  </div>
</template>
