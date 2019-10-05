const crypto = require("crypto")
const translation = require("./index")
const algo = "sha1"
const digest = "hex"
const cacheKey = "original-language-file"

exports.onPreBootstrap = async function({ cache, reporter }, options) {
  const originalPath = `${options.path}/${options.defaultLang}.json`
  const original = require(originalPath)
  if (!original) {
    reporter.info(`Can't find language JSON at ${originalPath}`)
    return;
  }

  const shasum = crypto
    .createHash(algo)
    .update(JSON.stringify(original))
    .digest(digest)
  reporter.info(`Checksum: ${shasum}`)

  let current = await cache.get(cacheKey)
  if (!current) {
    current = shasum
    reporter.info(`New checksum for translations`)
  } else if (current === shasum) {
    reporter.info(`No changes in language JSON ${originalPath}`)
    return;
  }
  reporter.info(`Required to fetch new translations for ${originalPath}`)
  await translation.translate({original, options})
  reporter.info(`Saved translations for ${options.langs.join(",")}`)

  await cache.set(cacheKey, current)
  reporter.info(`Set cached hash to ${current}`)
}
