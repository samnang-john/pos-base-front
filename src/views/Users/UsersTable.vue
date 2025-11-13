<template>
    <div class="bg-white p-6 rounded-xl shadow-lg animate-fade-in-down">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 mb-5 border-b border-gray-100">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div class="flex items-center">
          <span class="text-sm font-medium text-gray-700 whitespace-nowrap mr-2">Per Page</span>
          <select @change="getUsers(null)" v-model="perPage"
            class="appearance-none relative block w-20 px-3 py-2 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <span class="text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
          Found <span class="font-semibold text-indigo-600">{{ users.total }}</span> users
        </span>
      </div>

      <div class="relative w-full md:w-auto">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
        </div>
        <input v-model="search" @change="getUsers(null)"
          class="block w-full md:w-64 pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
          placeholder="Search products...">
      </div>
    </div>

    <!-- Table Section -->
    <div class="overflow-x-auto rounded-lg border border-gray-100">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <TableHeaderCell field="id" :sort-field="sortField" :sort-direction="sortDirection"
              @click="sortUsers('id')"
              class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              ID
            </TableHeaderCell>
            <TableHeaderCell field="image" :sort-field="sortField" :sort-direction="sortDirection"
              class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
              Image
            </TableHeaderCell>
            <TableHeaderCell field="title" :sort-field="sortField" :sort-direction="sortDirection"
              @click="sortUsers('title')" class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
              Username
            </TableHeaderCell>
            <TableHeaderCell field="category" :sort-field="sortField" :sort-direction="sortDirection"
              @click="sortUsers('category')" class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
              Full Name
            </TableHeaderCell>
            <TableHeaderCell field="price" :sort-field="sortField" :sort-direction="sortDirection"
              @click="sortUsers('price')" class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
              Role
            </TableHeaderCell>
            <TableHeaderCell field="updated_date" :sort-field="sortField" :sort-direction="sortDirection"
              @click="sortUsers('updated_date')" class="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
              Updated Date
            </TableHeaderCell>
            <TableHeaderCell field="actions"
              class="py-3.5 pl-3 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-6">
              Actions
            </TableHeaderCell>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-if="users.loading || !users.data.length">
            <td colspan="8" class="px-3 py-6 text-sm text-gray-500 text-center">
              <Spinner v-if="users.loading" class="mx-auto" />
              <p v-else class="text-center py-8 text-gray-500">
                No users found
              </p>
            </td>
          </tr>
          <tr v-else v-for="(user, index) of users.data" :key="user._id"
            class="animate-fade-in-down hover:bg-gray-50 transition-colors duration-150"
            :style="{ 'animation-delay': (index * 0.05) + 's' }">
            <td class="whitespace-nowrap py-2 pl-2 pr-2 text-sm font-medium text-gray-700 sm:pl-6">
              {{ (index + 1).toString().padStart(2, '0') }}
            </td>
            <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
              <div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <img class="h-full w-full object-cover" :src="user.image" :alt="user.full_name">
              </div>
            </td>
            <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate">
              {{ user.username }}
            </td>
            <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 max-w-xs truncate">
              {{ user.full_name }}
            </td>
            <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-900 font-medium">
              {{ user.role }}
            </td>
            <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
              {{ new Date(user.updated_at).toLocaleDateString('en-GB', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
              year: 'numeric'
              }) }}

            </td>
            <td class="relative whitespace-nowrap py-2 pl-2 pr-2 text-center text-sm font-medium sm:pr-6">
              <Menu as="div" class="relative inline-block text-left">
                <div>
                  <MenuButton
                    class="flex items-center rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200">
                    <span class="sr-only">Open options</span>
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
                        active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700',
                        'group flex w-full items-center px-4 py-2 text-sm',
                      ]" @click="editUser(user)">
                        <PencilIcon class="mr-3 h-4 w-4 text-indigo-500 group-hover:text-indigo-700"
                          aria-hidden="true" />
                        Edit
                      </button>
                      </MenuItem>
                      <MenuItem v-slot="{ active }">
                      <button :class="[
                        active ? 'bg-red-50 text-red-700' : 'text-gray-700',
                        'group flex w-full items-center px-4 py-2 text-sm',
                      ]" @click="deleteUser(user)">
                        <TrashIcon class="mr-3 h-4 w-4 text-red-500 group-hover:text-red-700" aria-hidden="true" />
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
    </div>

    <!-- Pagination -->
    <div v-if="!users.loading" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      <div v-if="users.data.length" class="text-sm text-gray-700">
        Showing <span class="font-medium">{{ users.from }}</span> to <span class="font-medium">{{ users.to
          }}</span> of
        <span class="font-medium">{{ users.total }}</span> results
      </div>
      <nav v-if="users.total > users.limit" class="flex items-center justify-between px-4 sm:px-0 mt-6">
        <div class="flex flex-1 justify-between sm:justify-end items-center space-x-2">
          <a v-for="(link, i) of users.links" :key="i" :disabled="!link.url" href="#"
            @click="getForPage($event, link)" aria-current="page"
            class="relative inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md"
            :class="[
              link.active
                ? 'z-10 bg-indigo-600 text-white shadow-md'
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200',
              i === 0 ? 'rounded-l-md' : '',
              i === users.links.length - 1 ? 'rounded-r-md' : '',
              !link.url ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : '',
              link.label.includes('Previous') || link.label.includes('Next') ? 'px-2.5' : ''
            ]">
            <span v-if="i === 0" class="sr-only">Previous</span>
            <span v-if="i === 0" aria-hidden="true">&laquo;</span>

            <span v-if="i === users.links.length - 1" class="sr-only">Next</span>
            <span v-if="i === users.links.length - 1" aria-hidden="true">&raquo;</span>

            <span v-if="i !== 0 && i !== users.links.length - 1" v-html="link.label"></span>
          </a>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import store from "../../store";
import Spinner from '../../components/core/Spinner.vue';
import { PRODUCTS_PER_PAGE } from '../../constants';
import TableHeaderCell from '../../components/core/Table/TableHeaderCell.vue';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import {
    EllipsisVerticalIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'

const perPage = ref(PRODUCTS_PER_PAGE);
const search = ref('');
const users = computed(() => store.state.users);
const sortField = ref('updated_at');
const sortDirection = ref('desc')

const user = ref({})
const showUserModal = ref(false);

const emit = defineEmits(['clickEdit'])

onMounted(() => {
    getUsers();
})

function getForPage(ev, link) {
  ev.preventDefault();
  if (!link.url || link.active) return;

  const baseUrl = 'http://localhost:8000/api/user/getAllUsers';
  const fullUrl = baseUrl + link.url;

  getUsers(fullUrl);
}

function getUsers(url = null) {
    store.dispatch("getUsers", {
        url,
        search: search.value,
        per_page: perPage.value,
        sort_field: sortField.value,
        sort_direction: sortDirection.value
    });
}

function sortUsers(field) {
    if (field === sortField.value) {
        sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc';
    } else {
        sortField.value = field;
        sortDirection.value = 'asc'
    }

    getUsers();
}

function deleteUser(user) {
    if (!confirm(`Are you sure you want to delete "${user.username}"?`)) {
        return
    }
    store.dispatch('deleteUser', user._id)
        .then(res => {
            store.dispatch('getUsers')
        })
}

function editUser(user) {
    emit('clickEdit', user)
}
</script>

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