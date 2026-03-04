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
    <div class="min-h-screen bg-[#F8F9FA] p-8 md:p-12">
        <!-- Header -->
        <div class="flex items-center gap-4 mb-8">
            <button @click="goBack"
                class="p-2 rounded-full hover:bg-white hover:shadow transition-all bg-transparent group">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                    stroke="currentColor" class="w-6 h-6 text-gray-700 group-hover:text-black">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <h1 class="text-3xl font-bold text-[#1A1A1A]">{{ $t('profile') }}</h1>
        </div>

        <!-- Profile Card -->
        <div class="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 p-10 md:p-16">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-16">

                <!-- Left Column: Avatar Upload -->
                <div class="lg:col-span-5 flex flex-col items-center">
                    <label for="upload"
                        class="relative w-48 h-48 bg-[#1A3C34] rounded-full flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all hover:opacity-90 shadow-lg border-4 border-white">

                        <div v-if="!image" class="flex flex-col items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-white opacity-50" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <p class="text-white text-xs opacity-70 uppercase tracking-widest font-black">{{
                                $t('TABLE.upload_image') }}</p>
                        </div>

                        <div v-else class="relative w-full h-full group/img">
                            <img :src="image"
                                class="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
                            <div
                                class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                    class="w-8 h-8 text-white mb-2 transform translate-y-2 group-hover/img:translate-y-0 transition-transform duration-300"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <p
                                    class="text-white text-[10px] font-black uppercase tracking-[0.2em] transform translate-y-2 group-hover/img:translate-y-0 transition-transform duration-300 delay-75">
                                    {{ $t('BUTTON.update') }}</p>
                            </div>
                        </div>

                        <input id="upload" type="file" class="hidden" @change="handleImageUpload" accept="image/*" />
                    </label>
                    <h2 class="mt-6 text-xl font-bold text-gray-800">{{ formData.name }}</h2>
                    <p class="text-gray-400 font-medium">@{{ formData.username }}</p>
                </div>

                <!-- Right Column: Form Fields -->
                <div class="lg:col-span-7">
                    <div class="space-y-6">
                        <!-- Full Name -->
                        <div class="flex flex-col gap-2">
                            <label class="text-gray-700 font-semibold">{{ $t('TABLE.full_name') }} <span
                                    class="text-red-500">*</span></label>
                            <input type="text" v-model="formData.name"
                                class="w-full bg-[#f8f9fa] border-none p-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#9A6A3A] transition-all" />
                        </div>

                        <!-- Username -->
                        <div class="flex flex-col gap-2">
                            <label class="text-gray-700 font-semibold">{{ $t('TABLE.username') }} <span
                                    class="text-red-500">*</span></label>
                            <input type="text" v-model="formData.username"
                                class="w-full bg-[#f8f9fa] border-none p-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#9A6A3A] transition-all" />
                        </div>

                        <div class="pt-4 border-t border-gray-100">
                            <p class="text-sm text-gray-400 mb-4">{{ $t('LOGIN.welcome_msg') }} (Optional to change
                                password)</p>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Password -->
                                <div class="flex flex-col gap-2">
                                    <label class="text-gray-700 font-semibold">{{ $t('TABLE.password') }}</label>
                                    <input type="password" v-model="formData.password"
                                        class="w-full bg-[#f8f9fa] border-none p-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#9A6A3A] transition-all" />
                                </div>

                                <!-- Confirm Password -->
                                <div class="flex flex-col gap-2">
                                    <label class="text-gray-700 font-semibold">{{ $t('TABLE.confirm_password')
                                    }}</label>
                                    <input type="password" v-model="formData.confir_pass"
                                        class="w-full bg-[#f8f9fa] border-none p-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#9A6A3A] transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-16 flex flex-col items-center gap-6 border-t border-gray-100 pt-10">
                <button @click="onUpdateProfile"
                    class="group relative w-full max-w-md bg-[#9A6A3A] hover:bg-[#86592d] text-white py-5 rounded-[1.25rem] font-bold text-xl shadow-xl shadow-brown-200 transition-all flex items-center justify-center gap-3"
                    :disabled="loading">
                    <div v-if="loading"
                        class="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"></div>
                    <template v-else>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            class="w-6 h-6">
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
    box-shadow: 0 10px 15px -3px rgba(154, 106, 58, 0.2), 0 4px 6px -4px rgba(154, 106, 58, 0.1);
}

input {
    transition: all 0.3s ease;
}
</style>
