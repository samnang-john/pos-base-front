=<script setup>
import { onMounted, ref, computed } from "vue";
import store from "../../store";
import Spinner from "../../components/core/Spinner.vue";
import TableHeaderCell from "../../components/core/Table/TableHeaderCell.vue";
import ConfirmModal from "../../components/AlertConfirm.vue";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import dayjs from "dayjs";
import { useI18n } from "vue-i18n";
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/vue/24/outline";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const { t } = useI18n();

const image = ref(null);
const listUsers = ref([]);
const search = ref("");
const isLoadingUser = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = ref(15);
const isModalOpen = ref(false); // Control modal visibility
const isModalConfirmOpen = ref(false); // Control modal visibility
const userForm = ref({
  name: "",
  username: "",
  password: "",
  confir_pass: "",
  image: "",
});
const isUpdate = ref(false); // Control For Update
const isErrorValue = ref(false);
const objEdit = ref(null);

const isFormValid = computed(() => {
  if (!isUpdate.value) {
    // Create Mode
    return (
      userForm.value.name.trim() !== "" &&
      userForm.value.username.trim() !== "" &&
      userForm.value.password.trim() !== "" &&
      userForm.value.confir_pass.trim() !== "" &&
      userForm.value.password === userForm.value.confir_pass
    );
  } else {
    // Update Mode
    const baseValid =
      userForm.value.name.trim() !== "" &&
      userForm.value.username.trim() !== "";

    // If password fields are used, they must match
    if (userForm.value.password || userForm.value.confir_pass) {
      return baseValid && userForm.value.password === userForm.value.confir_pass;
    }

    return baseValid;
  }
});

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
  image.value = null;
  userForm.value = {
    name: "",
    username: "",
    password: "",
    confir_pass: "",
    image: "",
  }; // Reset input on close
  isUpdate.value = false;
  isErrorValue.value = false;
  // objEdit.value = null;
};

const openModalConfirm = (user) => {
  isModalConfirmOpen.value = true;
  objEdit.value = user;
};

const submitUser = async () => {
  if (
    userForm.value.name !== "" ||
    userForm.value.username !== "" ||
    userForm.value.password !== "" ||
    userForm.value.confir_pass !== ""
  ) {
    try {
      if (userForm?.value?.password === userForm?.value?.confir_pass) {
        await store.dispatch("createUser", userForm.value);
        getUsers();
        closeModal();
        toast.success(t("TOAST.user_created"));
      } else {
        toast.error(t("TOAST.password_mismatch"));
      }
    } catch (error) {
      closeModal();
      console.log("Error=>", error);
      toast.error(t("TOAST.user_unsuccessful"));
    }
  } else {
    isErrorValue.value = true;
    toast.error(t("TOAST.field_required"));
  }
};

// Handle Edit action
const onEdit = (user) => {
  console.log("user>>>>", user);
  isUpdate.value = true;
  isModalOpen.value = true;
  objEdit.value = user;
  image.value = user?.image;
  userForm.value = {
    image: user?.image,
    name: user?.name,
    username: user?.username,
    password: "",
    confir_pass: "",
  };
};

const onUpdate = async () => {
  try {
    const obj = {
      id: objEdit.value?._id,
      name: userForm.value?.name,
      username: userForm?.value?.username,
      password: userForm?.value?.password,
      confir_pass: userForm?.value?.confir_pass,
      image: userForm?.value?.image,
    };
    if (userForm?.value?.password === userForm?.value?.confir_pass) {
      await store.dispatch("updateUser", obj);
      getUsers();
      closeModal();
      toast.success(t("TOAST.user_updated"));
    } else {
      toast.error(t("TOAST.password_mismatch"));
    }
  } catch (error) {
    console.log("Error=>", error);
    toast.error(t("TOAST.user_unsuccessful"));
  }
};

const onDeleteUser = async () => {
  try {
    await store.dispatch("deleteUser", objEdit.value?._id);
    getUsers();
    toast.info(t("TOAST.user_deleted"));
  } catch (error) {
    toast.error(t("TOAST.user_unsuccessful"));
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
    <h1 class="text-3xl font-semibold">{{ $t('MENU.user') }}</h1>
    <button type="button" @click="openModal()"
      class="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#986b41] hover:bg-[#B68E65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
      {{ $t('BUTTON.add_new') }}
    </button>
  </div>

  <!-- Table List Items -->
  <div class="bg-white p-6 rounded-xl shadow-lg animate-fade-in-down">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 mb-5 border-b border-gray-100">
      <div class="relative w-full md:w-auto">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
        </div>
        <input v-model="search" @change="getUsers(1)"
          class="block w-full md:w-64 pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
          :placeholder="$t('TABLE.search_user')" />
      </div>
    </div>

    <!-- Table Section -->
    <div class="overflow-x-auto rounded-lg border border-gray-100">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <TableHeaderCell field="id" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              {{ $t('TABLE.no') }}
            </TableHeaderCell>
            <TableHeaderCell field="image" class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
              {{ $t('TABLE.image') }}
            </TableHeaderCell>
            <TableHeaderCell field="title" class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
              {{ $t('TABLE.name') }}
            </TableHeaderCell>
            <TableHeaderCell field="title" class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
              {{ $t('TABLE.user_name') }}
            </TableHeaderCell>
            <TableHeaderCell field="actions"
              class="py-3.5 pl-3 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-6">
              {{ $t('TABLE.created_date') }}
            </TableHeaderCell>
            <TableHeaderCell field="actions"
              class="py-3.5 pl-3 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-6">
              {{ $t('TABLE.action') }}
            </TableHeaderCell>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-if="isLoadingUser || !listUsers.length">
            <td colspan="6" class="px-3 py-6 text-sm text-gray-500 text-center">
              <Spinner v-if="isLoadingUser" class="mx-auto" />
              <p v-else class="text-center py-8 text-gray-500">
                {{ $t('TABLE.no_user_found') }}
              </p>
            </td>
          </tr>
          <tr v-else v-for="(user, index) of listUsers" :key="user._id"
            class="animate-fade-in-down hover:bg-gray-50 transition-colors duration-150"
            :style="{ 'animation-delay': index * 0.05 + 's' }">
            <td class="whitespace-nowrap py-2 pl-2 pr-2 text-sm font-medium text-gray-700 sm:pl-6">
              {{ (index + 1).toString().padStart(2, "0") }}
            </td>
            <td class="whitespace-nowrap px-2 py-2 text-sm">
              <div class="h-12 w-12 flex-shrink-0">
                <img v-if="user.image" :src="user.image" :alt="user.name" class="h-12 w-12 rounded-lg object-cover shadow-sm" />
                <div v-else class="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                   <svg class="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </td>

            <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate">
              {{ user.name }}
            </td>
            <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate">
              {{ user.username }}
            </td>
            <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate">
              {{ dayjs(user.created_at).format("DD/MM/YYYY - HH:mm A") }}
            </td>

            <td class="relative whitespace-nowrap py-2 pl-2 pr-2 text-center text-sm font-medium sm:pr-6">
              <Menu as="div" class="relative inline-block text-left">
                <div>
                  <MenuButton
                    class="flex items-center rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200">
                    <span class="sr-only">{{ $t('BUTTON.open_options') }}</span>
                    <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
                  </MenuButton>
                </div>

                <transition enter-active-class="transition duration-100 ease-out"
                  enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                  leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
                  leave-to-class="transform scale-95 opacity-0">
                  <MenuItems
                    class="absolute right-0 z-10 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div class="py-1">
                      <MenuItem v-slot="{ active }">
                      <button :class="[
                        active
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-700',
                        'group flex w-full items-center px-4 py-2 text-sm',
                      ]" @click="onEdit(user)">
                        <PencilIcon class="mr-3 h-4 w-4 text-indigo-500 group-hover:text-indigo-700"
                          aria-hidden="true" />
                        {{ $t('BUTTON.edit') }}
                      </button>
                      </MenuItem>
                      <MenuItem v-slot="{ active }">
                      <button :class="[
                        active ? 'bg-red-50 text-red-700' : 'text-gray-700',
                        'group flex w-full items-center px-4 py-2 text-sm',
                      ]" @click="openModalConfirm(user)">
                        <TrashIcon class="mr-3 h-4 w-4 text-red-500 group-hover:text-red-700" aria-hidden="true" />
                        {{ $t('BUTTON.delete') }}
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
      <div class="flex justify-between items-center py-4 px-4">
        <button @click="prevPage" :disabled="currentPage === 1"
          class="px-4 py-2 rounded-lg border bg-white disabled:opacity-40">
          {{ $t('BUTTON.previous') }}
        </button>

        <span class="text-gray-600 text-sm">
          {{ $t('BUTTON.page') }} {{ currentPage }} {{ $t('BUTTON.of') }} {{ totalPages }}
        </span>

        <button @click="nextPage" :disabled="currentPage === totalPages"
          class="px-4 py-2 rounded-lg border bg-white disabled:opacity-40">
          {{ $t('BUTTON.next') }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <!-- Modal -->
<div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center"
  style="background-color: rgba(0, 0, 0, 0.5)" @click="closeModal">
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex" @click.stop>

    <!-- Left panel: brand + avatar -->
    <div class="w-2/5 bg-[#986b41] p-8 flex flex-col items-center justify-center text-white">
      <label for="upload"
        class="relative w-32 h-32 rounded-full border-4 border-white/30 flex items-center justify-center cursor-pointer bg-white/10 hover:bg-white/20 transition-colors overflow-hidden">
        <div v-if="!image" class="flex flex-col items-center gap-1">
          <svg class="w-7 h-7 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span class="text-[11px] text-white/80">{{ $t('TABLE.upload_image') }}</span>
        </div>
        <img v-else :src="image" class="w-full h-full object-cover" />
        <input id="upload" type="file" class="hidden" @change="handleImageUpload" />
      </label>

      <h2 class="mt-5 text-lg font-semibold text-center">
        {{ isUpdate ? $t('TABLE.update_user') : $t('TABLE.add_new_user') }}
      </h2>
      <p class="mt-1 text-xs text-white/70 text-center">
        {{ userForm.name || userForm.username || '—' }}
      </p>
    </div>

    <!-- Right panel: form fields -->
    <div class="w-3/5 p-8">
      <div class="mb-4">
        <label for="name" class="block text-xs font-medium text-gray-600 mb-1">
          {{ $t('TABLE.full_name') }} <span class="text-red-500">*</span>
        </label>
        <input v-model="userForm.name" id="name" type="text" :class="[
          'w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#986b41] focus:border-[#986b41]',
          isErrorValue && !userForm.name ? 'border-red-500' : 'border-gray-300',
        ]" :placeholder="$t('TABLE.enter_name')" required />
      </div>

      <div class="mb-4">
        <label for="username" class="block text-xs font-medium text-gray-600 mb-1">
          {{ $t('TABLE.username') }} <span class="text-red-500">*</span>
        </label>
        <input v-model="userForm.username" id="username" type="text" :class="[
          'w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#986b41] focus:border-[#986b41]',
          isErrorValue && !userForm.username ? 'border-red-500' : 'border-gray-300',
        ]" :placeholder="$t('TABLE.enter_username')" required />
      </div>

      <div class="h-px bg-gray-100 my-5"></div>

      <div class="grid grid-cols-2 gap-3 mb-6">
        <div>
          <label for="password" class="block text-xs font-medium text-gray-600 mb-1">
            {{ $t('TABLE.password') }} <span class="text-red-500">*</span>
          </label>
          <input v-model="userForm.password" id="password" type="password" :class="[
            'w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#986b41] focus:border-[#986b41]',
            isErrorValue && !userForm.password ? 'border-red-500' : 'border-gray-300',
          ]" :placeholder="$t('TABLE.enter_password')" required />
        </div>
        <div>
          <label for="confir_pass" class="block text-xs font-medium text-gray-600 mb-1">
            {{ $t('TABLE.confirm_password') }} <span class="text-red-500">*</span>
          </label>
          <input v-model="userForm.confir_pass" id="confir_pass" type="password" :class="[
            'w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#986b41] focus:border-[#986b41]',
            isErrorValue && !userForm.confir_pass ? 'border-red-500' : 'border-gray-300',
          ]" :placeholder="$t('TABLE.enter_confirm_password')" required />
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <button @click="closeModal"
          class="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none">
          {{ $t('BUTTON.cancel') }}
        </button>
        <button v-if="isUpdate" @click="onUpdate"
          class="px-5 py-2 text-sm text-white bg-[#986b41] rounded-lg hover:bg-[#B68E65] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!isFormValid">
          {{ $t('BUTTON.update') }}
        </button>
        <button v-else @click="submitUser"
          class="px-5 py-2 text-sm text-white bg-[#986b41] rounded-lg hover:bg-[#B68E65] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!isFormValid">
          {{ $t('BUTTON.save') }}
        </button>
      </div>
    </div>
  </div>
</div>

  <!-- Modal Confirm -->
  <ConfirmModal v-model:is-open="isModalConfirmOpen" :title="$t('MODAL.confirm_delete_user_title')"
    :message="$t('MODAL.confirm_delete_user_msg')" @confirm="onDeleteUser" @cancel="console.log('Cancelled')" />
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