<template>
  <TransitionRoot as="template" :show="show">
    <Dialog as="div" class="relative z-50" @close="show = false">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-white/50 backdrop-blur-sm transition-opacity" />
      </TransitionChild>

      <div class="fixed z-10 inset-0 overflow-y-auto">
        <div class="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel
              class="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-[700px] sm:w-full">
              <Spinner v-if="loading"
                class="absolute left-0 top-0 bg-white right-0 bottom-0 flex items-center justify-center" />
              <header class="py-3 px-4 flex justify-between items-center">
                <DialogTitle as="h3" class="text-lg leading-6 font-medium text-gray-900">
                  {{ user._id ? `Update user: "${props.user.username}"` : 'Create new User' }}
                </DialogTitle>
                <button @click="closeModal()"
                  class="w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer hover:bg-[rgba(0,0,0,0.2)]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </header>
              <form @submit.prevent="onSubmit">
                <div class="bg-white px-4 pt-5 pb-4">
                  <CustomInput class="mb-2" v-model="user.username" label="Username" />
                  <CustomInput type="file" class="mb-2" label="Profile Image" @change="file => user.image = file" />
                  <CustomInput class="mb-2" v-model="user.full_name" label="Full Name" />
                  <CustomInput class="mb-2" v-model="user.password" label="Password" />
                  <CustomInput class="mb-2" v-model="user.role" label="Role" />
                </div>
                <footer class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit"
                    class="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ml-3">
                    Submit
                  </button>
                  <button type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    @click="closeModal" ref="cancelButtonRef">
                    Cancel
                  </button>
                </footer>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { computed, onUpdated, ref } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import CustomInput from "../../components/core/CustomInput.vue";
import store from "../../store/index.js";
import Spinner from "../../components/core/Spinner.vue";

const loading = ref(false)

const props = defineProps({
    modelValue: Boolean,
    user: {
        required: true,
        type: Object
    }
})

const user = ref({
    _id: props.user._id,
    username: props.user.username,
    password: props.user.password,
    full_name: props.user.full_name,
    image: props.user.image,
    role: props.user.role,
    created_at: props.user.created_at,
    updated_at: props.user.updated_at
})

const emit = defineEmits(['update:modelValue', 'close'])

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

onUpdated(() => {
    user.value = {
        _id: props.user._id,
        username: props.user.username,
        password: props.user.password,
        full_name: props.user.full_name,
        image: props.user.image,
        role: props.user.role,
        created_at: props.user.created_at,
        updated_at: props.user.updated_at
    }
})

function closeModal() {
    show.value = false
    emit('close')
}

function onSubmit() {
    loading.value = true
    if (user.value._id) {
        store.dispatch('updateUser', user.value)
            .then(response => {
                loading.value = false;
                if (response.status === 200) {
                    store.dispatch('getUsers')
                    closeModal()
                }
            })
    }   else {
        store.dispatch('createUser', user.value)
            .then(response => {
                loading.value = false;
                if (response.status === 201) {
                    store.dispatch('getUsers')
                    closeModal()
                }
            })
            .catch(err => {
                loading.value = false;
                debugger;
            })
    }
}

</script>