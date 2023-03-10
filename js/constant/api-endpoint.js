const baseURL = new URL('https://quran-data.vercel.app')

const apiEndpoint = {
    listSurah: {
        method: 'GET',
        url: `${baseURL.origin}/quran`
    },
    detailSurah: {
        method: 'GET',
        url: (numberSurah) => `${baseURL.origin}/quran/${numberSurah}?imamId=7`
    }
}

export default apiEndpoint