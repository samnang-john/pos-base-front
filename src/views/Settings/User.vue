<script setup>
import { onMounted, ref } from "vue";
import store from "../../store";
import Spinner from "../../components/core/Spinner.vue";
import TableHeaderCell from "../../components/core/Table/TableHeaderCell.vue";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import dayjs from "dayjs";
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/vue/24/outline";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const image = ref(null);
const listUsers = ref([]);
const search = ref("");
const isLoadingUser = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = ref(15);
const isModalOpen = ref(false); // Control modal visibility
const userForm = ref({
  name: "",
  username: "",
  password: "",
  image: "",
});
const isUpdate = ref(false); // Control For Update
const isErrorValue = ref(false);
const objEdit = ref(null);

onMounted(async () => {
  try {
    await Promise.all([getUsers()]);
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});

const getUsers = async (page = 1) => {
  isLoadingUser.value = true;
  try {
    const res = await store.dispatch("getUsers", {
      page,
      pageSize: pageSize.value,
    });

    listUsers.value = res?.data?.items || [];

    // save pagination
    currentPage.value = res?.data?.pagination?.currentPage;
    totalPages.value = res?.data?.pagination?.totalPages;
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingUser.value = false;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    getUsers(currentPage.value + 1);
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    getUsers(currentPage.value - 1);
  }
};

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  userForm.value = {
    name: "",
    description: "",
  }; // Reset input on close
  isUpdate.value = false;
  // objEdit.value = null;
};

const submitUser = async () => {
  if (
    userForm.value.name !== "" ||
    userForm.value.username !== "" ||
    userForm.value.password !== ""
  ) {
    try {
      await store.dispatch("createUser", userForm.value);
      getUsers();
      closeModal();
      toast.success("User type created successfully!");
    } catch (error) {
      closeModal();
      console.log("Error=>", error);
      toast.error("User type unsuccessfully!");
    }
  } else {
    isErrorValue.value = true;
    toast.error("Field Required!");
  }
};

// Handle Edit action
const onEdit = (wood_type) => {
  isUpdate.value = true;
  isModalOpen.value = true;
  objEdit.value = wood_type;
  userForm.value = {
    name: wood_type?.name,
    description: wood_type?.description,
  };
};

const onUpdate = async () => {
  try {
    const obj = {
      id: objEdit.value?._id,
      name: userForm.value?.name,
      description: userForm?.value?.description,
    };
    await store.dispatch("updateWoodType", obj);
    getUsers();
    closeModal();
    toast.success("Wood type updated successfully!");
  } catch (error) {
    console.log("Error=>", error);
    toast.error("Wood type update unsuccessfully!");
  }
};

const onDeleteWoodType = async (woodTypeId) => {
  try {
    await store.dispatch("deleteWoodType", woodTypeId);
    getUsers();
    toast.info("Wood type deleted successfully!");
  } catch (error) {
    toast.error("Wood type unsuccessfully!");
  }
};

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    userForm.value.image = file; // store actual file
    image.value = URL.createObjectURL(file); // preview
  }
};
</script>

<template>
  <!-- Main Header -->
  <div class="flex items-center justify-between mb-3">
    <h1 class="text-3xl font-semibold">Users</h1>
    <button
      type="button"
      @click="openModal()"
      class="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#986b41] hover:bg-[#B68E65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Add New
    </button>
  </div>

  <!-- Table List Items -->
  <div class="bg-white p-6 rounded-xl shadow-lg animate-fade-in-down">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 mb-5 border-b border-gray-100"
    >
      <div class="relative w-full md:w-auto">
        <div
          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
        >
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
        </div>
        <input
          v-model="search"
          @change="getProducts(null)"
          class="block w-full md:w-64 pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
          placeholder="Search wood type..."
        />
      </div>
    </div>

    <!-- Table Section -->
    <div class="overflow-x-auto rounded-lg border border-gray-100">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <TableHeaderCell
              field="id"
              class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
            >
              ID
            </TableHeaderCell>
            <TableHeaderCell
              field="title"
              class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
            >
              Name
            </TableHeaderCell>
            <TableHeaderCell
              field="title"
              class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
            >
              Username
            </TableHeaderCell>
            <TableHeaderCell
              field="actions"
              class="py-3.5 pl-3 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-6"
            >
              Created Date
            </TableHeaderCell>
            <TableHeaderCell
              field="actions"
              class="py-3.5 pl-3 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-6"
            >
              Action
            </TableHeaderCell>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-if="isLoadingUser || !listUsers.length">
            <td colspan="8" class="px-3 py-6 text-sm text-gray-500 text-center">
              <Spinner v-if="isLoadingUser" class="mx-auto" />
              <p v-else class="text-center py-8 text-gray-500">
                No wood type found
              </p>
            </td>
          </tr>
          <tr
            v-else
            v-for="(user, index) of listUsers"
            :key="user._id"
            class="animate-fade-in-down hover:bg-gray-50 transition-colors duration-150"
            :style="{ 'animation-delay': index * 0.05 + 's' }"
          >
            <td
              class="whitespace-nowrap py-2 pl-2 pr-2 text-sm font-medium text-gray-700 sm:pl-6"
            >
              {{ (index + 1).toString().padStart(2, "0") }}
            </td>

            <td
              class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate"
            >
              {{ user.name }}
            </td>
            <td
              class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate"
            >
              {{ user.username }}
            </td>
            <td
              class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate"
            >
              {{ dayjs(user.created_at).format("DD/MM/YYYY - HH:MM A") }}
            </td>

            <td
              class="relative whitespace-nowrap py-2 pl-2 pr-2 text-center text-sm font-medium sm:pr-6"
            >
              <Menu as="div" class="relative inline-block text-left">
                <div>
                  <MenuButton
                    class="flex items-center rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    <span class="sr-only">Open options</span>
                    <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
                  </MenuButton>
                </div>

                <transition
                  enter-active-class="transition duration-100 ease-out"
                  enter-from-class="transform scale-95 opacity-0"
                  enter-to-class="transform scale-100 opacity-100"
                  leave-active-class="transition duration-75 ease-in"
                  leave-from-class="transform scale-100 opacity-100"
                  leave-to-class="transform scale-95 opacity-0"
                >
                  <MenuItems
                    class="absolute right-0 z-10 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div class="py-1">
                      <MenuItem v-slot="{ active }">
                        <button
                          :class="[
                            active
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-gray-700',
                            'group flex w-full items-center px-4 py-2 text-sm',
                          ]"
                          @click="onEdit(wood)"
                        >
                          <PencilIcon
                            class="mr-3 h-4 w-4 text-indigo-500 group-hover:text-indigo-700"
                            aria-hidden="true"
                          />
                          Edit
                        </button>
                      </MenuItem>
                      <MenuItem v-slot="{ active }">
                        <button
                          :class="[
                            active ? 'bg-red-50 text-red-700' : 'text-gray-700',
                            'group flex w-full items-center px-4 py-2 text-sm',
                          ]"
                          @click="onDeleteWoodType(user._id)"
                        >
                          <TrashIcon
                            class="mr-3 h-4 w-4 text-red-500 group-hover:text-red-700"
                            aria-hidden="true"
                          />
                          Delete
                        </button>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </transition>
              </Menu>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="flex justify-between items-center py-4">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 rounded-lg border bg-white disabled:opacity-40"
        >
          Previous
        </button>

        <span class="text-gray-600">
          Page {{ currentPage }} of {{ totalPages }}
        </span>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 rounded-lg border bg-white disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <div
    v-if="isModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center"
    style="background-color: rgba(0, 0, 0, 0.4)"
    @click="closeModal"
  >
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md" @click.stop>
      <h2 v-if="isUpdate" class="text-lg font-bold text-gray-800 mb-4">
        Update User
      </h2>
      <h2 v-else class="text-lg font-bold text-gray-800 mb-4">Add New User</h2>
      <div class="flex justify-center mb-4">
        <label
          for="upload"
          class="w-[160px] h-[200px] border border-gray-300 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white"
        >
          <div v-if="!image" class="flex flex-col items-center gap-2">
            <img src="" class="w-10 opacity-50" />
            <p class="text-gray-500">Upload Image</p>
          </div>

          <img
            v-else
            :src="image"
            class="w-full h-full object-cover rounded-xl"
          />

          <input
            id="upload"
            type="file"
            class="hidden"
            @change="handleImageUpload"
          />
        </label>
      </div>
      <div class="mb-4">
        <label for="name" class="block text-sm font-medium text-gray-700"
          >Full Name
          <span class="text-red-500">*</span>
        </label>
        <input
          v-model="userForm.name"
          id="name"
          type="text"
          :class="[
            'mt-1 w-full p-2 border rounded-lg focus:ring-[#986b41] focus:border-[#986b41]',
            isErrorValue ? 'border-red-500' : 'border-gray-300',
          ]"
          placeholder="Enter Name"
          required
        />
      </div>
      <div class="mb-4">
        <label for="username" class="block text-sm font-medium text-gray-700"
          >Username
          <span class="text-red-500">*</span>
        </label>
        <input
          v-model="userForm.username"
          id="username"
          type="text"
          :class="[
            'mt-1 w-full p-2 border rounded-lg focus:ring-[#986b41] focus:border-[#986b41]',
            isErrorValue ? 'border-red-500' : 'border-gray-300',
          ]"
          placeholder="Enter username"
          required
        />
      </div>
      <div class="mb-4">
        <label for="password" class="block text-sm font-medium text-gray-700"
          >Password
          <span class="text-red-500">*</span>
        </label>
        <input
          v-model="userForm.password"
          id="password"
          type="password"
          :class="[
            'mt-1 w-full p-2 border rounded-lg focus:ring-[#986b41] focus:border-[#986b41]',
            isErrorValue ? 'border-red-500' : 'border-gray-300',
          ]"
          placeholder="Enter password"
          required
        />
      </div>
      <!-- <div class="mb-4">
        <label for="note" class="block text-sm font-medium text-gray-700"
          >Note</label
        >
        <input
          v-model="userForm.description"
          id="note"
          type="text"
          class="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#986b41] focus:border-[#986b41]"
          placeholder="Enter wood type note"
        />
      </div> -->
      <div class="flex justify-end space-x-2">
        <button
          @click="closeModal"
          class="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none"
        >
          Cancel
        </button>
        <button
          v-if="isUpdate"
          @click="onUpdate"
          class="px-4 py-2 text-white bg-[#986b41] rounded-lg hover:bg-[#B68E65] focus:outline-none"
        >
          Update
        </button>
        <button
          v-else
          @click="submitUser"
          class="px-4 py-2 text-white bg-[#986b41] rounded-lg hover:bg-[#B68E65] focus:outline-none"
        >
          Add
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations */
.animate-fade-in-down {
  animation: fadeInDown 0.5s ease-out;
}

@keyframes fadeInDown {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
