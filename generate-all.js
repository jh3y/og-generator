const fs = require("fs")
const path = require('path')
const Yaml = require("js-yaml")
const generateOgImage = require("./generate-og-image.js")
// Use this script to generate everything with defaults.
// Generate a tmp folder
const generateAll = async () => {
  await fs.promises.mkdir(`${process.cwd()}/.tmp`, { recursive: true })
  await fs.promises.mkdir(`${process.cwd()}/src/assets/images/og/`, {
    recursive: true,
  })
  // Load the SVG template file
  const TEMPLATE_PATH = `${process.cwd()}/og-generator/og-template.svg`
  const TEMPLATE_FILE = await fs.promises.readFile(TEMPLATE_PATH, "utf-8")

  // Build up all the files you want to use.
  const POSTS = await fs.promises.readdir(`${process.cwd()}/src/writing/`)
  const SCRAPS = await fs.promises.readdir(`${process.cwd()}/src/scrapbook/`)

  const FILES = [
    ...POSTS.map((p) => `${process.cwd()}/src/writing/${p}`),
    ...SCRAPS.map((s) => `${process.cwd()}/src/scrapbook/${s}`),
    `${process.cwd()}/src/pages/uses.md`,
    `${process.cwd()}/src/pages/about.md`
  ]
  const genImages = async () => {
    for (let f = 0; f < FILES.length; f++) {
      if (FILES[f].indexOf(".md") !== -1) {
        const MARKDOWN_FILE = await fs.promises.readFile(FILES[f], "utf-8")
        const FILE_NAME = path.basename(FILES[f])
        const SLUG = FILE_NAME.slice(0, FILE_NAME.indexOf('.md'))
        const DOC = Yaml.load(
          MARKDOWN_FILE.slice(0, MARKDOWN_FILE.indexOf("---", 1))
          )
        await generateOgImage(SLUG, DOC.title, TEMPLATE_FILE, DOC.heroImage, Math.floor(Math.random() * 359))
      }
    }
    // Generate the extras after
    await generateOgImage('index', "The Home of Jhey Tompkins", TEMPLATE_FILE, '/assets/images/with-bernard.jpg', 0)
    await generateOgImage('writing', "Jhey Writes About Fun Things", TEMPLATE_FILE, '/assets/images/writing.jpg', Math.floor(Math.random() * 359))
    await generateOgImage('scrapbook', "Jhey Has a Digital Scrapbook", TEMPLATE_FILE, '/assets/images/scrapping.jpg', Math.floor(Math.random() * 359))
    await generateOgImage('contact', "Get In Touch", TEMPLATE_FILE, '/assets/images/contact.jpg', Math.floor(Math.random() * 359))
    await generateOgImage('code', "Jhey Writes Lots of Code", TEMPLATE_FILE, '/assets/images/code.jpg', Math.floor(Math.random() * 359))
    await generateOgImage('404', "Uh Oh - The Bears Have Broken It Again", TEMPLATE_FILE, '/assets/images/thumbsdown.jpg', Math.floor(Math.random() * 359))
  }
  genImages()
}
generateAll()
