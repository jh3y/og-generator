const Sharp = require("sharp")
const fs = require("fs")
const jsdom = require("jsdom")
const { JSDOM } = jsdom
const puppeteer = require("puppeteer")

const generateOgImage = async (slug, title, template, image, hue, override = false) => {
  // Load the markdown file
  // TODO:: Change Slug To Override
  // TODO:: Accept full color or extract that part completely to a callback on Document
  // TODO:: Try and extract this so it can be installed and used elsewhere by other things
  if (fs.existsSync(`${process.cwd()}/src/assets/images/og/${slug}.png`) && !override) return
  if (image) {
    // Grab the header image
    const IMAGE_PATH = `${process.cwd()}/src${image}`
    // Take the image and crop it down to size?
    // Output it to a tmp directory
    Sharp(IMAGE_PATH)
      .resize(300, 300, {
        fit: "cover",
        position: "attention",
      })
      .flop()
      .toFormat("png")
      .toFile(".tmp/output.png")
  }

  // Load a document based on the SVG template
  const {
    window: { document },
  } = new JSDOM(`<html><head></head><body>${template}</body></html>`)
  // Generate a random color for the banner and cap
  const COLOR = `hsl(${hue}, 80%, 50%)`
  const WIDTH = parseInt(document.querySelector('.og').getAttribute('width'), 10)
  const HEIGHT = parseInt(document.querySelector('.og').getAttribute('height'), 10)
  // Set the fill color where we need to
  document
    .querySelectorAll("[data-hsl]")
    .forEach((el) => el.setAttribute("fill", COLOR))
  // Grab the header image and set the correct path for the cropped image.
  // Only do this because we might want to debug our template in the browser.
  document
    .querySelector("#heroImage")
    .setAttribute("xlink:href", "./output.png")
  if (!image) document.querySelector('#heroImage').remove()
  // Set the OG card title
  document.querySelector(".og__title").textContent = title
  // Write this SVG to the tmp folder
  fs.writeFileSync(
    `${process.cwd()}/.tmp/output.svg`,
    document.querySelector("svg").outerHTML,
    "utf-8"
  )
  // Use Puppeteer to snap it
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(`file://${process.cwd()}/.tmp/output.svg`)
  await page.setViewport({ width: WIDTH, height: HEIGHT })
  // Push it into the correct slot under src/assets/images/og
  await page.screenshot({
    path: `${process.cwd()}/src/assets/images/og/${slug}.png`,
    type: "png",
    fullPage: true,
  })
  // Close the instance
  await page.close()
  await browser.close()
  console.info(`Generated image for ${slug}`)
}

module.exports = generateOgImage
