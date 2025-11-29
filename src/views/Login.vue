<script setup>
// Import Vue
import { ref } from "vue";

// Import Library
import LockClosedIcon from "@heroicons/vue/24/solid/LockClosedIcon";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

const store = useStore();
const router = useRouter();

const loading = ref(false);
const errorMsg = ref("");
const isOpen = ref(false);

const user = {
  username: "samnang",
  password: "admin123",
};

function login() {
  // router.push({ name: "app.dashboard" });
  loading.value = true;
  store
    .dispatch("login", user)
    .then(() => {
      loading.value = false;
      console.log("data", store.state.user.data);
      // if (store.state.user.data.role === "Admin") {
      router.push({ name: "app.dashboard" });
      // } else if (store.state.user.data.role === "Cashier") {
      // router.push({ name: "app.pos" });
      // }
    })
    .catch(({ response }) => {
      loading.value = false;
      errorMsg.value = response.data.message;
    });
}

const closeModal = () => {
  isOpen.value = false;
};
</script>

<template>
  <div class="min-h-screen flex flex-col lg:flex-row">
    <!-- Left Side: Image with Text Overlay (Hidden on small screens, shown on lg and up) -->
    <div class="hidden lg:block lg:w-1/2 bg-gray-100 relative">
      <img
        src="https://c4.wallpaperflare.com/wallpaper/370/69/142/instrumento-workshop-machines-woodwork-hd-wallpaper-preview.jpg"
        alt="Login background"
        class="w-full h-full object-cover"
      />
      <!-- Dark Overlay -->
      <div class="absolute inset-0 bg-black/60"></div>
      <!-- Text Overlay -->
      <div
        class="absolute inset-0 flex flex-col items-center justify-center gap-2"
      >
        <div class="w-full max-w-md">
          <p class="text-left text-3xl font-medium text-white">Welcome To</p>
          <p class="text-left mt-2 mb-4 text-white text-4xl font-bold">
            WOOD POS SYSTEM
          </p>
        </div>
      </div>

      <!-- <div class="absolute inset-0 flex items-center justify-center">
        <h2 class="text-white text-4xl font-bold drop-shadow-lg">WOOD POS</h2>
      </div> -->
    </div>

    <!-- Right Side: Form (Full width on small screens, half on lg and up) -->
    <div
      class="min-h-screen lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white"
    >
      <div class="w-full max-w-md">
        <div class="flex justify-center">
          <img
            class="w-24 h-24 rounded-full shadow-lg"
            src="https://i.pinimg.com/736x/11/74/b8/1174b87fd25a959131875fdf17ee0071.jpg"
            alt="user photo"
          />
        </div>
        <h2 class="text-center text-3xl font-extrabold text-gray-900 mt-4">
          {{ "WOOD POS SYSTEM" }}
        </h2>
        <p class="text-center mt-2 mb-4">
          Welcome, please sig in into your account.
        </p>
        <form class="space-y-6" @submit.prevent="login">
          <!-- Email Input -->
          <div>
            <label for="email-address" class="sr-only">Email address</label>
            <input
              id="email-address"
              name="email"
              type="string"
              autocomplete="email"
              required
              v-model="user.username"
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:border-[#986b41] sm:text-sm"
              placeholder="Email address"
            />
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              v-model="user.password"
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:border-[#986b41] sm:text-sm"
              placeholder="Password"
            />
          </div>

          <!-- Remember Me -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                v-model="user.remember"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="loading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#986b41] hover:bg-[#B68E65] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed"
            >
              <svg
                v-if="loading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <LockClosedIcon class="h-5 w-5 text-white" aria-hidden="true" />
              </span>
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Error Message Dialog -->
    <TransitionRoot appear :show="isOpen" as="template">
      <Dialog as="div" @close="closeModal" class="relative z-10">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div
            class="flex min-h-full items-center justify-center p-4 text-center"
          >
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <DialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-gray-900"
                >
                  Login Error!
                </DialogTitle>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    {{ errorMsg }}
                  </p>
                </div>

                <div class="mt-4">
                  <button
                    type="button"
                    class="inline-flex justify-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    @click="closeModal"
                  >
                    Close
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>
