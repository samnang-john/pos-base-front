<script setup>
import { ref, onMounted } from "vue";
import store from "../store";
import { toast } from "vue3-toastify";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();

const image = ref(null);
const loading = ref(false);
const formData = ref({
    id: "",
    name: "",
    username: "",
    password: "",
    confir_pass: "",
    image: null,
});

onMounted(async () => {
    await fetchUserData();
});

const fetchUserData = async () => {
    try {
        const user = await store.dispatch("getUser");
        if (user) {
            formData.value.id = user._id;
            formData.value.name = user.name;
            formData.value.username = user.username;
            image.value = user.image;
            formData.value.image = user.image;
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error(t('TOAST.load_failed'));
    }
};

const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        formData.value.image = file;
        image.value = URL.createObjectURL(file);
    }
};

const onUpdateProfile = async () => {
    if (!formData.value.name || !formData.value.username) {
        toast.error(t('TOAST.field_required'));
        return;
    }

    if (formData.value.password && formData.value.password !== formData.value.confir_pass) {
        toast.error(t('TOAST.password_mismatch'));
        return;
    }

    loading.value = true;
    try {
        const res = await store.dispatch("updateUser", {
            id: formData.value.id,
            name: formData.value.name,
            username: formData.value.username,
            password: formData.value.password,
            image: formData.value.image,
        });

        if (res?.status === 200 || res?.data) {
            toast.success(t('TOAST.user_updated'));
            await fetchUserData();
            // Reset password fields
            formData.value.password = "";
            formData.value.confir_pass = "";
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        toast.error(t('TOAST.user_unsuccessful'));
    } finally {
        loading.value = false;
    }
};

const goBack = () => router.back();
</script>

<template>
    <div class="min-h-screen bg-[#F8F9FA] p-6 md:p-10">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-6 max-w-2xl mx-auto">
            <button @click="goBack"
                class="p-2 rounded-full hover:bg-white hover:shadow transition-all bg-transparent group">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                    stroke="currentColor" class="w-5 h-5 text-gray-700 group-hover:text-black">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <h1 class="text-2xl font-bold text-[#1A1A1A]">{{ $t('profile') }}</h1>
        </div>

        <div class="max-w-2xl mx-auto space-y-5">

            <!-- Avatar card -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
                <label for="upload"
                    class="relative w-20 h-20 rounded-full flex-shrink-0 flex items-center justify-center cursor-pointer overflow-hidden bg-[#f8f9fa] border border-gray-200 hover:border-[#9A6A3A] transition-all">
                    <div v-if="!image" class="flex flex-col items-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <img v-else :src="image" class="w-full h-full object-cover" />
                    <input id="upload" type="file" class="hidden" @change="handleImageUpload" accept="image/*" />
                </label>
                <div class="flex-1 min-w-0">
                    <h2 class="text-base font-semibold text-gray-900 truncate">{{ formData.name || '—' }}</h2>
                    <p class="text-sm text-gray-400 truncate">@{{ formData.username || '—' }}</p>
                </div>
                <label for="upload"
                    class="text-xs font-medium text-[#9A6A3A] hover:text-[#7a5330] cursor-pointer px-3 py-1.5 rounded-lg border border-[#9A6A3A]/30 hover:bg-[#9A6A3A]/5 transition-all whitespace-nowrap">
                    {{ $t('TABLE.upload_image') }}
                </label>
            </div>

            <!-- Basic info card -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 class="text-sm font-semibold text-gray-800 mb-4">{{ $t('TABLE.full_name') }} & {{ $t('TABLE.username') }}</h3>
                <div class="space-y-4">
                    <div class="flex flex-col gap-1.5">
                        <label class="text-xs font-medium text-gray-600">{{ $t('TABLE.full_name') }}
                            <span class="text-red-500">*</span></label>
                        <input type="text" v-model="formData.name"
                            class="w-full bg-[#f8f9fa] border border-gray-200 px-3 py-2.5 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#9A6A3A] focus:border-[#9A6A3A] transition-all" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="text-xs font-medium text-gray-600">{{ $t('TABLE.username') }}
                            <span class="text-red-500">*</span></label>
                        <input type="text" v-model="formData.username"
                            class="w-full bg-[#f8f9fa] border border-gray-200 px-3 py-2.5 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#9A6A3A] focus:border-[#9A6A3A] transition-all" />
                    </div>
                </div>
            </div>

            <!-- Password card -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 class="text-sm font-semibold text-gray-800">{{ $t('TABLE.password') }}</h3>
                <p class="text-xs text-gray-400 mt-0.5 mb-4">Leave blank to keep your current password</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1.5">
                        <label class="text-xs font-medium text-gray-600">{{ $t('TABLE.password') }}</label>
                        <input type="password" v-model="formData.password"
                            class="w-full bg-[#f8f9fa] border border-gray-200 px-3 py-2.5 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#9A6A3A] focus:border-[#9A6A3A] transition-all" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="text-xs font-medium text-gray-600">{{ $t('TABLE.confirm_password') }}</label>
                        <input type="password" v-model="formData.confir_pass"
                            class="w-full bg-[#f8f9fa] border border-gray-200 px-3 py-2.5 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#9A6A3A] focus:border-[#9A6A3A] transition-all" />
                    </div>
                </div>
            </div>

            <!-- Action -->
            <div class="flex justify-end pb-4">
                <button @click="onUpdateProfile"
                    class="inline-flex items-center justify-center gap-2 bg-[#9A6A3A] hover:bg-[#86592d] text-white px-6 py-2.5 rounded-lg font-medium text-sm shadow-md shadow-brown-200 transition-all disabled:opacity-60"
                    :disabled="loading">
                    <div v-if="loading"
                        class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <template v-else>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {{ $t('BUTTON.update') }}
                    </template>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.shadow-brown-200 {
    box-shadow: 0 6px 12px -3px rgba(154, 106, 58, 0.25), 0 2px 4px -2px rgba(154, 106, 58, 0.1);
}

input {
    transition: all 0.3s ease;
}
</style>