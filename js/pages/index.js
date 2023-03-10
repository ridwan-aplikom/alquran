import apiEndpoint from '../constant/api-endpoint.js'
import { setLanguage, getLanguage, getLanguageText } from '../languages/index.js'
import listLanguage from '../languages/list.js'

document.addEventListener("DOMContentLoaded", main)

/**
* Main function
*/
async function main() {
    displayBaseLayout()
    const endpoint = apiEndpoint.listSurah.url
    const loadingAnimation = getLoadingAnimationContainer()
    const errorAnimation = getErrorAnimationContainer()
    const mainApp = getMainAppContainer()

    try {
        mainApp.style.display = 'none'
        loadingAnimation.style.display = 'flex'
        errorAnimation.style.display = 'none'
        
        const response = await fetch(endpoint)
        const responseJSON = await response.json()
        const quranData = responseJSON.data
        initLanguageSelect()
        initSearchBar(quranData)
        renderListSurahElements(quranData)
        
        mainApp.style.display = 'block'
        loadingAnimation.style.display = 'none'
    } catch (trace) {
        console.error(trace)
        loadingAnimation.style.display = 'none'
        errorAnimation.style.display = 'flex'
        mainApp.style.display = 'none'
    }
}

/**
 * Make base layout visible
 */
function displayBaseLayout () {
    document.querySelector('.container').style.display = 'block'
}

/**
 * Get Main App Element Container
 * @returns
 */
function getMainAppContainer () {
    return document.querySelector('#mainApp')
}

/**
 * Get Content Container DOM Element
 */
function getContentContainer () {
    return document.querySelector('#content')
}

/**
 * Get Loading Animation Element Container
 * @returns
 */
function getLoadingAnimationContainer () {
    return document.querySelector('.loadingAnimation')
}

/**
 * Get Error Animation DOM Element Container
 * @returns
 */
 function getErrorAnimationContainer () {
    return document.querySelector('.errorAnimation')   
}

/**
 * Get Navbar DOM element container
 */
function getNavbarContainer () {
    return document.querySelector('#navbar')
}

/**
 * Get search bar element
 * @returns
 */
function getSearchBar () {
    return {
        container: getNavbarContainer().querySelector('.searchContainer'),
        input: getNavbarContainer().querySelector('.searchContainer input')
    }
}

/**
 * Build element for surah item
 * @param {object} quranData
 * @param {string} quranData.name
 * @param {string} quranData.translation
 * @param {string} quranData.type
 * @param {string|number} quranData.numberSurah
 * @param {string|number} quranData.ayahCount
 * @returns
 */
function SurahItem({ name, translation, type, numberSurah, ayahCount }) {
    return `
        <a class="surahItem" href="detail.html?numberSurah=${numberSurah}">
            <div class="nameInfo">
                <div class="number">${numberSurah}</div>
                <div>
                    <div class="name">${name}</div>
                    <div class="translation">${translation}</div>
                </div>
            </div>
            <div class="additionalInfo">
                <div>${type}</div>
                <div>${ayahCount} ${getLanguageText('ayah')}</div>
            </div>
        </a>
    `
}

/**
 * Get surah list elements based from api data
 * @param {*} quranData 
 * @return 
 */
function getSurahListElements (quranData) {
    return quranData.reduce((elements, surah) => {
        let surahItem = ''
        const language = getLanguage()

        if (language === listLanguage.en) {
            surahItem = SurahItem({
                name: surah.asma.en.long,
                translation: surah.asma.translation.en,
                type: surah.type.en,
                numberSurah: surah.number,
                ayahCount: surah.ayahCount
            })
        } else {
            surahItem = SurahItem({
                name: surah.asma.id.long,
                translation: surah.asma.translation.id,
                type: surah.type.id,
                numberSurah: surah.number,
                ayahCount: surah.ayahCount
            })
        }

        return elements += surahItem
    }, '')
}

/**
 * Initialize select element to change language
 */
function initLanguageSelect () {
    const languageSelect = document.querySelector('.language-select select')
    
    if (getLanguage() === listLanguage.en) {
        languageSelect.value = listLanguage.en
    } else {
        languageSelect.value = listLanguage.id
    }

    languageSelect.onchange = (event) => {
        const language = event.target.value
        setLanguage(language)
        window.location.reload()
    }
}

/**
 * Init search bar to perform search surah
 */
function initSearchBar (quranData) {
    const searchBar = getSearchBar().input

    searchBar.placeholder = getLanguageText('search')
    searchBar.oninput = (event) => {
        const filteredData = quranData.filter(surah => {
            /**
             * Optimize search with regex and lowercase
             * @param {string} text 
             */
            const queryOptimization = (text) => {
                return text.replace(/\'+/g, '').replace(/\-+/g, ' ').toLowerCase()
            }

            const surahName = queryOptimization(surah.asma.id.long)
            const searchQuery = queryOptimization(event.target.value)
            return surahName.includes(searchQuery)
        })

        getContentContainer().innerHTML = getSurahListElements(filteredData)
    }
}

/**
 * Render surah item elements based from api data
 * @param {*} quranData 
 */
function renderListSurahElements(quranData) {
    getContentContainer().innerHTML = getSurahListElements(quranData)
}