import { createI18n } from 'vue-i18n'
import en from './eng'
import km from './kh'

const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('lang') || 'en',
    fallbackLocale: 'en',
    messages: {
        en,
        km,
    },
})

export default i18n
