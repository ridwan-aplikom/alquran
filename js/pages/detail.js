import apiEndpoint from '../constant/api-endpoint.js'
import { getLanguage } from '../languages/index.js'
import listLanguage from '../languages/list.js'

document.addEventListener("DOMContentLoaded", main)

/**
 * Main function
 */
async function main() {
    displayBaseLayout()
    const loadingAnimation = getLoadingAnimationContainer()
    const notFoundAnimation = getNotFoundAnimationContainer()
    const errorAnimation = getErrorAnimationContainer()
    const mainApp = getMainAppContainer()

    try {
        loadingAnimation.style.display = 'flex'
        notFoundAnimation.style.display = 'none'
        errorAnimation.style.display = 'none'
        mainApp.style.display = 'none'

        const numberSurah = getNumberSurah()
        if (isNumberSurahValid(numberSurah)) {
            const endpoint = apiEndpoint.detailSurah.url(numberSurah)
            const response = await fetch(endpoint)
            const responseJSON = await response.json()
            const quranData = responseJSON.data
            renderNavbar({ 
                name: (getLanguage() === listLanguage.en) ? quranData.asma.en.short : quranData.asma.id.short,
                number: quranData.number,                
            })
            renderListAyahElements(quranData)

            loadingAnimation.style.display = 'none'
            mainApp.style.display = 'block'
            return
        }
        
        notFoundAnimation.style.display = 'flex'
        loadingAnimation.style.display = 'none'
        mainApp.style.display = 'none'
    } catch (trace) {
        console.error(trace)
        loadingAnimation.style.display = 'none'
        notFoundAnimation.style.display = 'none'
        errorAnimation.style.display = 'flex'
        mainApp.style.display = 'none'
    }
}

/**
 * Get number surah from window query params
 */
function getNumberSurah () {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('numberSurah');
}

/**
 * Cheking is value between 1 and 114
 * @param {number} value
 */
function isNumberSurahValid (value) {
    return (value >= 1 && value <= 114) ? true : false
}

/**
 * Make base layout visible
 */
 function displayBaseLayout () {
    document.querySelector('.container').style.display = 'block'
}

/**
 * Get Loading Animation DOM Element Container
 */
function getLoadingAnimationContainer () {
    return document.querySelector('.loadingAnimation')
}

/**
 * Get Not Found Animation DOM Element Container
 * @returns
 */
function getNotFoundAnimationContainer () {
    return document.querySelector('.notFoundAnimation')
}

/**
 * Get Error Animation DOM Element Container
 * @returns
 */
function getErrorAnimationContainer () {
    return document.querySelector('.errorAnimation')   
}

/**
 * Get Main Application DOM Element Container
 * @returns
 */
function getMainAppContainer () {
    return document.querySelector('#mainApp')
}

/**
 * Get Navbar Element Container
 */
function getNavbarContainer () {
    return document.querySelector('#navbar')
}

/**
 * Get Content Container DOM Element
 */
function getContentContainer () {
    return document.querySelector('#content')
}

/**
 * Get Ayah Container Element
 * @returns
 */
function getAyahContainer () {
    return getContentContainer().querySelector('#ayahContainer')
}

/**
 * Get Audio Control Element
 */
function getAudioControl () {
    return document.querySelector('#audioPanel audio')
}

/**
 * Create string ayah item element
 * @param {object} quranData
 * @param {string|number} quranData.juzNumber
 * @param {string|number} quranData.ayahNumber
 * @param {string} quranData.arabic
 * @param {string} quranData.read
 * @param {string} quranData.translation
 */
function AyahItem({ juzNumber = '', ayahNumber = '', arabic, read, translation }) {
    const surahAyahElement = (juzNumber !== '' && ayahNumber !== '')
        ? `
            <div class="topContainer">
                <div class="surahAndAyahInfo">${juzNumber}:${ayahNumber}</div>                
                <button>
                    <span class="material-icons">play_arrow</span>
                </button>
                <div>Juz ${juzNumber}</div>
                <div class="ayahNumber">${ayahNumber}</div>
            </div>
        ` : ''

    return `
        <div class="ayahItem">
            ${surahAyahElement}
            <div class="arabic">
                ${arabic}
            </div>
            <div class="read">
                ${read}
            </div>
            <div class="translation">
                ${translation}
            </div>
        </div>
    `
}

/**
 * Render Navbar Children with Surah Information
 * @param {object} surah 
 * @param {string|number} surah.number
 * @param {string} surah.name
 */
function renderNavbar({ type, number, name, ayahCount }) {
    const surahNameElement = getNavbarContainer().querySelector('.surahName')
    const backButton = getNavbarContainer().querySelector('.backButton')
    surahNameElement.innerText = `${number}. ${name}`
    backButton.onclick = () => {
        window.location.href = './index.html'
    }
}

/**
 * Render quran ayah item elements
 */
function renderListAyahElements (quranData) {
    const ayahContainer = getAyahContainer()
    const audioControl = getAudioControl()

    const getListAyahElements = (quranData) => {
        const language = getLanguage()
        const preBismillah = quranData.preBismillah
        const defaultValueListAyahElements = (preBismillah !== null) 
        ? AyahItem({
            arabic: preBismillah.text.ar,
            read: (language === listLanguage.en) ? preBismillah.text.read.en : preBismillah.text.read.id,
            translation: (language === listLanguage.en) ? preBismillah.translation.en : preBismillah.translation.id
        }) : ''

        return quranData.ayahs.reduce((elements, ayah) => {
            let ayahItem = ''
            if (language === listLanguage.en) {
                ayahItem = AyahItem({
                    juzNumber: ayah.juz,
                    ayahNumber: ayah.number.insurah,
                    arabic: ayah.text.ar,
                    read: ayah.text.read.en,
                    translation: ayah.translation.en
                })
            } else {
                ayahItem = AyahItem({
                    juzNumber: ayah.juz,
                    ayahNumber: ayah.number.insurah,
                    arabic: ayah.text.ar,
                    read: ayah.text.read.id,
                    translation: ayah.translation.id
                })
            }

            return elements + ayahItem
        }, defaultValueListAyahElements)
    }

    const listAyahElements = getListAyahElements(quranData)
    ayahContainer.innerHTML = listAyahElements
    audioControl.src = quranData.recitation.full
    setListAyahElementsListener(quranData)
}

/**
 * Set play pause audo on ayah item element
 */
function setListAyahElementsListener (quranData) {
    const audioControl = getAudioPlayer()
    const ayahsElements = getContentContainer().querySelectorAll('.ayahItem')
    let playedAyah = null
    let isPlaying = false

    /**
     * Get Active Played Ayah Recitation DOM Element
     * @param {void} dispatch 
     * @returns 
     */
    const getPlayedAyahElement = (dispatch = (element) => {}) => {
        let playedAyahElement = null
        ayahsElements.forEach(element => {
            const elementNumberOfSurahInfo = element.querySelector('.surahAndAyahInfo')
            if (elementNumberOfSurahInfo) {
                const [juzNumber, ayahNumber] = elementNumberOfSurahInfo.innerText.split(':')
                if (playedAyah) {
                    if (ayahNumber === playedAyah.toString()) {
                        playedAyahElement = element
                    }
                }
            }
            dispatch(element)
        })

        return playedAyahElement
    }

    ayahsElements.forEach(element => {
        const buttonPlay = element.querySelector('button')
        const elementNumberOfSurahInfo = element.querySelector('.surahAndAyahInfo')
        if (elementNumberOfSurahInfo) {
            const [juzNumber, ayahNumber] = elementNumberOfSurahInfo.innerText.split(':')
            const ayahObjectData = quranData.ayahs.find(ayah => ayah.number.insurah == ayahNumber)
            const ayahAudioUrl = ayahObjectData.audio.url

            buttonPlay.onclick = () => {
                if (playedAyah && Number(ayahNumber) === playedAyah) {
                    isPlaying ? audioControl.pause() : audioControl.play()
                } else if (playedAyah && Number(ayahNumber) !== playedAyah) {
                    let playedAyahElement = getPlayedAyahElement()

                    if (playedAyahElement) {
                        const buttonPlay = playedAyahElement.querySelector('button')
                        buttonPlay.querySelector('.material-icons').innerHTML = 'play_arrow'
                    }

                    audioControl.src = ayahAudioUrl
                    playedAyah = Number(ayahNumber)
                    audioControl.play()
                } else {
                    audioControl.src = ayahAudioUrl
                    playedAyah = Number(ayahNumber)
                    audioControl.play()
                }
            }
        }
    })

    audioControl.onplaying = () => {    
        isPlaying = true
        let listActiveAyahElement = []
        let playedAyahElement = getPlayedAyahElement(element => {
            if (element.classList.contains('active')) {
                listActiveAyahElement.push(element)
            }
        })

        listActiveAyahElement.forEach(element => {
            element.classList.remove("active")
        })

        if (playedAyahElement) {
            const buttonPlay = playedAyahElement.querySelector('button')
            playedAyahElement.classList.add("active")
            playedAyahElement.scrollIntoView({behavior: "smooth", block: "start"})
            buttonPlay.querySelector('.material-icons').innerHTML = 'pause'
        }
    }

    audioControl.onpause = () => {
        isPlaying = false
        let playedAyahElement = getPlayedAyahElement()

        if (playedAyahElement) {
            const buttonPlay = playedAyahElement.querySelector('button')
            playedAyahElement.classList.remove("active")
            buttonPlay.querySelector('.material-icons').innerHTML = 'play_arrow'
        }
    }

    audioControl.onended = () => {
        let playedAyahElement = getPlayedAyahElement()

        if (playedAyahElement) {
            const buttonPlay = playedAyahElement.querySelector('button')
            buttonPlay.querySelector('.material-icons').innerHTML = 'play_arrow'
        }

        const nextAyahNumber = playedAyah + 1
        const ayahObjectData = quranData.ayahs.find(ayah => ayah.number.insurah === nextAyahNumber)

        if (ayahObjectData) {
            const ayahAudioUrl = ayahObjectData.audio.url
            audioControl.src = ayahAudioUrl
            audioControl.play()
            playedAyah = nextAyahNumber
            isPlaying = true
        } else {
            playedAyah = null
            isPlaying = false
        }
    }
}

/**
 * Get custom audio DOM element
 * @returns
 */
function getAudioPlayer () {
    const baseElement = document.querySelector('.audioPlayer')
    const playPauseButton = baseElement.querySelector('.playPauseButton')
    const audioPlayer = baseElement.querySelector('audio')
    const progressBar = baseElement.querySelector('.slider')
    const currentTimeElement = baseElement.querySelector('.audioTime .currentTime')
    const durationTimeElement = baseElement.querySelector('.audioTime .duration')

    /**
     * Convert seconds to time string format
     * @param {number} number - seconds input
     * @returns 
     */
    const formatTime = (number) => {
        let hours = Math.floor(number / 3600);
        let minutes = Math.floor((number - (hours * 3600)) / 60);
        let seconds = Math.floor(number - (hours * 3600) - (minutes * 60));
        let H, M, S;
        if (hours < 10) H = ("0" + hours);
        if (minutes < 10) M = ("0" + minutes);
        if (seconds < 10) S = ("0" + seconds);

        if (hours > 0) {
            return (H || hours) + ':' + (M || minutes) + ':' + (S || seconds);
        } else {
            return (M || minutes) + ':' + (S || seconds);
        }
    };

    playPauseButton.addEventListener("click", () => {
        const isPlaying = !audioPlayer.paused
        isPlaying ? audioPlayer.pause() : audioPlayer.play()
    })

    audioPlayer.addEventListener("play", () => {
        const buttonIcon = playPauseButton.querySelector('.material-icons')
        buttonIcon.innerHTML = 'pause'
    })

    audioPlayer.addEventListener("pause", () => {
        const buttonIcon = playPauseButton.querySelector('.material-icons')
        buttonIcon.innerHTML = 'play_arrow'
    })

    audioPlayer.addEventListener("canplay", () => {
        progressBar.max = audioPlayer.duration
        progressBar.value = audioPlayer.currentTime
    })

    audioPlayer.addEventListener("timeupdate", () => {
        currentTimeElement.innerText = formatTime(audioPlayer.currentTime)
        progressBar.value = audioPlayer.currentTime
    })

    audioPlayer.addEventListener("durationchange", () => {
        durationTimeElement.innerText = formatTime(audioPlayer.duration)
    })

    progressBar.addEventListener('input', () => {
        audioPlayer.pause()
        audioPlayer.currentTime = progressBar.value;
        setTimeout(() => {
            audioPlayer.play()
        }, 100)
    })

    return audioPlayer
}