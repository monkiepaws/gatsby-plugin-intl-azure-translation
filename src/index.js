const axios = require("axios")
const fs = require("fs")
// const original = require("../../../src/intl/en")
// const en = require("./__mocks__/en-mock")
// const { apiUri, apiKey } = require("./environment")
// const langs = ["en","ja", "fr"]
// const defaultLang = "en"
// const path = "./src/intl"
// const options = { langs, defaultLang, apiUri, apiKey, path }

// Flattens the original JSON file and prepares for Azure Translation Text Api
function flattenMessages(nestedMessages) {
  return Object.keys(nestedMessages).reduce((messages, key) => {
    const value = nestedMessages[key]

    if (typeof value === "string") {
      messages = messages.concat([{Text: value}])
    } else {
      messages = messages.concat(flattenMessages(value))
    }

    return messages
  }, [])
}

// Organises the translations into the same shape as the original JSON
function expandMessages(flattenedMessages, original) {
  const messages = [...flattenedMessages]

  const expand = e => Object.keys(e).reduce((ex, key) => {
    const value = e[key]

    if (typeof value === "string") {
      const msg = messages.shift()
      ex[key] = msg;
    } else {
      ex[key] = expand(value)
    }

    return ex
  }, {})

  return expand(original)
}

// Maps a fetch call to receive translations for each language
function fetchAllTranslations(messages, options) {
  const toLangs = options.langs.filter(lang => lang !== options.defaultLang)
  return toLangs.map((lang) => fetchTranslationsForLanguage(messages, lang, options))
}

// Makes the Api call for a give language
function fetchTranslationsForLanguage(messages, toLang, options) {
  const url = `${options.apiUri}&from=${options.defaultLang}&to=${toLang}`
  return axios.post(url, messages, {headers: {"Ocp-Apim-Subscription-Key": options.apiKey}})
}

// Organises the fetched responses into a Map by language
function mapTranslations(responses) {
  const flattenedTranslations = responses.map(flattenTranslation)
  const map = new Map(flattenedTranslations)
  return map
}

// Removes extraneous content for responses and returns an array ready for mapping
function flattenTranslation({ data }) {
  const text = data.map(t => t.translations[0].text)
  const toLang = data[0].translations[0].to
  return [toLang, text]
}

// Converts a Map with flattened values into a Map with values shaped as the original JSON
function expandTranslations(flatMap, original) {
  const expandedMap = new Map()
  flatMap.forEach((messages, language) => {
    const translations = expandMessages(messages, original)
    expandedMap.set(language, translations)
  })
  return expandedMap
}

// Writes translations to disk as JSON, saved as {language}.json
async function writeFiles(expandedMap, {path}) {
  expandedMap.forEach((translations, language) => {
    const json = JSON.stringify(translations, null, 2)
    fs.writeFile(`${path}/${language}.json`, json, "utf8", (err) => {
      if (err) {
        console.log(`An error occurred while writing ${language} JSON to file`)
        throw err
      }
      console.log(`${language} JSON file is saved`)
    })
  })
}

// Main function
function translate({original, options}) {
  const messages = flattenMessages(original)
  const promises = fetchAllTranslations(messages, options)
  return Promise.all(promises)
    .then(mapTranslations)
    .then(flatMap => expandTranslations(flatMap, original))
    .then(expandedMap => writeFiles(expandedMap, options))
    .catch(err => console.error(err))
}

// if (process.env.NODE_ENV !== "test") {
//   translate({original, options})
// }

module.exports = {
  translate,
  flattenMessages,
  expandMessages,
  fetchAllTranslations,
  fetchTranslationsForLanguage,
  mapTranslations,
  flattenTranslation,
  expandTranslations,
  writeFiles
}
