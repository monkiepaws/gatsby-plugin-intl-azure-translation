const translate = require("../index")
const en = require("../__mocks__/en-mock.json")
const ja = require("../__mocks__/data-ja-mock")
const fr = require("../__mocks__/data-fr-mock")
const mockMaps = require("../__mocks__/map-mock")

jest.mock("axios")
const axios = require("axios")
jest.mock("fs")
const fs = require("fs")
jest.mock("../environment")
const { apiUri, apiKey } = require("../__mocks__/environment")

const prepared = [
  { Text: "Great Title" },
  { Text: "Awesome description" },
  { Text: "Next" },
  { Text: "Previous" },
  { Text: "404 nothing here!" },
  { Text: "Garden state" },
  { Text: "Sunshine state" },
]
const flattened = [
  "Great Title",
  "Awesome description",
  "Next",
  "Previous",
  "404 nothing here!",
  "Garden state",
  "Sunshine state",
]
const responses = [{ data: ja }, { data: fr }]

const options = {
  langs: ["en", "ja", "fr"],
  defaultLang: "en",
  apiUri,
  apiKey,
}

describe("flattenMessages()", () => {
  test("should correctly prepare an array for Azure Translation Text", () => {
    const expected = [...prepared]
    const actual = translate.flattenMessages(en)
    expect(actual).toEqual(expected)
  })
  test("should return an empty array if there are no messages in object", () => {
    const expected = []
    const actual = translate.flattenMessages({})
    expect(actual).toEqual(expected)
  })
})
describe("expandMessages()", () => {
  test("should correctly expand back to the original object's shape", () => {
    const expected = en
    const actual = translate.expandMessages([...flattened], en)
    expect(actual).toEqual(expected)
  })
})
describe("mapTranslations()", () => {
  test("should correctly create a new map with lang: translation array k:v pairs", () => {
    const expected = mockMaps.flat
    const actual = translate.mapTranslations(responses)
    expect(actual).toEqual(expected)
  })
})
describe("expandTranslations()", () => {
  test("should expand all language translations back to original object's shape and return a Map", () => {
    const expected = mockMaps.shaped
    const actual = translate.expandTranslations(mockMaps.flat, en)
    expect(actual).toEqual(expected)
  })
})
describe("fetchAllTranslations()", () => {
  test("should make two api calls with correct params", () => {
    const spy = jest.spyOn(axios, "post")
    const url = `${apiUri}&from=en&to=`
    translate.fetchAllTranslations(prepared, options)
    expect(spy).toHaveBeenNthCalledWith(1, `${url}ja`, prepared, {
      headers: { "Ocp-Apim-Subscription-Key": apiKey },
    })
    expect(spy).toHaveBeenNthCalledWith(2, `${url}fr`, prepared, {
      headers: { "Ocp-Apim-Subscription-Key": apiKey },
    })

    spy.mockRestore()
  })
})
describe("writeFiles()", () => {
  test("should save two json files to disk", () => {})
})
