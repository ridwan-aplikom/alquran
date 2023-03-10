import keys from '../constant/local-storage-keys.js';
import listLanguage from './list.js'
import idLanguage from './id.js'
import enLanguage from './en.js'

/**
 * Set language data to web storage
 * @param {string} value
 */
export function setLanguage (value) {
    localStorage.setItem(keys.language, value);
}

/**
 * Get current app language value from web storage
 * @returns
 */
export function getLanguage () {
    return localStorage.getItem(keys.language);
}

/**
 * Get language text from key
 * @param {string} key
 * @returns
 */
export function getLanguageText (key) {
    const language = getLanguage();
    let languageText = ''

    if (language === listLanguage.en) {
        languageText = enLanguage[key];
    } else {
        languageText = idLanguage[key];
    }

    return languageText
}