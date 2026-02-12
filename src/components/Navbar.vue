<template>
    <header class="sticky top-0 z-50 flex justify-between items-center p-3 h-14 shadow bg-white">
        <button @click="emit('toggle-sidebar')"
            class="flex items-center justify-center rounded transition-colors w-8 h-8 text-gray-700 hover:bg-black/10">
            <Bars3Icon class="w-6" />
        </button>
        <div class="flex items-center gap-3">
            <Menu as="div" class="relative inline-block text-left">
    <MenuButton class="flex items-center gap-2 rounded px-2 py-1 text-sm text-gray-700 hover:bg-black/10">
        <img
            :src="currentLang === 'en'
                ? 'https://flagcdn.com/w20/gb.png'
                : 'https://flagcdn.com/w20/kh.png'"
            class="w-5 h-4 rounded-sm"
        />
        <span>{{ currentLang === 'en' ? $t('BUTTON.english') : $t('BUTTON.khmer') }}</span>
        <ChevronDownIcon class="h-4 w-4 text-gray-400" />
    </MenuButton>

    <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
    >
        <MenuItems
            class="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
            <MenuItem v-slot="{ active }">
                <button
                    @click="setLanguage('en')"
                    class="flex w-full items-center gap-3 px-3 py-2 text-sm"
                    :class="active ? 'bg-indigo-600 text-white' : 'text-gray-900'"
                >
                    <img src="https://flagcdn.com/w20/gb.png" class="w-5 h-4 rounded-sm" />
                    {{ $t('BUTTON.english') }}
                </button>
            </MenuItem>

            <MenuItem v-slot="{ active }">
                <button
                    @click="setLanguage('km')"
                    class="flex w-full items-center gap-3 px-3 py-2 text-sm"
                    :class="active ? 'bg-indigo-600 text-white' : 'text-gray-900'"
                >
                    <img src="https://flagcdn.com/w20/kh.png" class="w-5 h-4 rounded-sm" />
                    {{ $t('BUTTON.khmer') }}
                </button>
            </MenuItem>
        </MenuItems>
    </transition>
</Menu>


        <Menu as="div" class="relative inline-block text-left">
            <MenuButton class="flex items-center">
                <img src="https://randomuser.me/api/portraits/men/1.jpg" class="rounded-full w-8 mr-2">
                <small>{{ currentUser.name }}</small>
                <ChevronDownIcon class="h-5 w-5 text-violet-200 hover:text-violet-100" aria-hidden="true" />
            </MenuButton>

            <transition enter-active-class="transition duration-100 ease-out"
                enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0">
                <MenuItems
                    class="absolute right-0 mt-2 w-36 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div class="px-1 py-1">
                        <MenuItem v-slot="{ active }">
                        <button :class="[
                            active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                            'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                        ]">
                            <UserIcon :active="active" class="mr-2 h-5 w-5 text-indigo-400" aria-hidden="true" />
                            Profile
                        </button>
                        </MenuItem>
                        <MenuItem v-slot="{ active }">
                        <button @click="logout" :class="[
                            active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                            'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                        ]">
                            <ArrowLeftOnRectangleIcon :active="active" class="mr-2 h-5 w-5 text-indigo-400"
                                aria-hidden="true" />
                            Logout
                        </button>
                        </MenuItem>

                    </div>
                </MenuItems>
            </transition>
        </Menu>
        </div>
    </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Bars3Icon, UserIcon, ArrowLeftOnRectangleIcon, ChevronDownIcon } from '@heroicons/vue/24/solid'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import store from '../store'
import router from "../router"

const emit = defineEmits(['toggle-sidebar'])

/* User */
const currentUser = computed(() => store.state.user.data)

/* 🌐 i18n */
const { locale } = useI18n()

/* Language state */
const currentLang = ref('en')

onMounted(() => {
    const savedLang = localStorage.getItem('lang') || 'en'
    currentLang.value = savedLang
    locale.value = savedLang
})

function setLanguage(lang) {
    currentLang.value = lang
    localStorage.setItem('lang', lang)
    locale.value = lang
}

/* Logout */
function logout() {
    store.dispatch('logout').then(() => {
        router.push({ name: 'login' })
    })
}
</script>





<style scoped></style>