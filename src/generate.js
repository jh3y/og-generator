const Sharp = require("sharp");
const fs = require("fs");
const os = require("os");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const pino = require("pino");
const puppeteer = require("puppeteer");

const LOG = pino({ prettyPrint: true });
const TYPES = ["OG", "TWITTER_BANNER", "YOUTUBE_THUMBNAIL", "YOUTUBE_FRAME"];

/**
 * Generate an asset image in png form using the provided template/type
 * @param {string} title - Text to show on the asset. Example, "Amazing Guide to Making Things".
 * @param {string} template - Path to template file to be used.
 * @param {string} type - If no template is provided, provide a type to be used with "Out of the box" ones.
 * @param {string} image - Path to image being used for specs reflection.
 * @param {number|string} accent - Accent for asset. Can either be a single hue or a defined color.
 * @param {boolean} override - Override existing asset.
 */
const generateOgImage = async (
  title = "Amazing Piece of Content",
  template,
  type = "OG",
  image,
  accent = 10,
  output = "./og-asset.png",
  override = false
) => {
  // Check if the asset already exists. If it does, don't make a new one.
  if (fs.existsSync(output) && !override) return false;
  const TMP_IMAGE_PATH = `${os.tmpdir()}/og-generator-output.png`;
  const TMP_SVG_PATH = `${os.tmpdir()}/og-generator-output.svg`;
  /**
   * If there's an image, grab it and process it with Sharp.
   * We're going to resize it and flip it as if it's reflected.
   */
  if (image && !fs.existsSync(image))
    throw Error("Image not found for reflection");
  if (image) {
    const IMAGE_PATH = `${image}`;
    /**
     * Grab the image, resize, crop, flip, and output to temp directory.
     */
    Sharp(IMAGE_PATH)
      .resize(300, 300, {
        fit: "cover",
        position: "attention",
      })
      .flop()
      .toFormat("png")
      .toFile(TMP_IMAGE_PATH);
  }

  if (!template && type && TYPES.indexOf(type) === -1)
    throw Error("Invalid template type passed");

  const TEMPLATE_PATH =
    template || `${__dirname}/../templates/${type.toLowerCase()}.svg`;

  // Grab the template file either from given templates or provided template file.
  const TEMPLATE_FILE = await fs.promises.readFile(TEMPLATE_PATH, "utf-8");
  /**
   * Use JSDOM to load up the provided template.
   * This is where we make manipulations in the DOM before screenshotting.
   */
  const {
    window: { document },
  } = new JSDOM(`<html><head></head><body>${TEMPLATE_FILE}</body></html>`);

  // Generate the color to be used in the border/cap details.
  const COLOR = isNaN(parseInt(accent, 10))
    ? accent
    : `hsl(${accent}, 80%, 50%)`;
  /**
   * Grab the width and height of the template.
   * This is based on the SVG having width/height attributes.
   */
  const SVG = document.querySelector("svg");
  // If the SVG doesn't exist or there's no width/height, bail out!
  if (!SVG) throw Error("Template does not contain SVG");
  if (!SVG.hasAttribute("width") || !SVG.hasAttribute("height"))
    throw Error("No width and height on template.");
  // Grab the width and height but parse them as Integer.
  const WIDTH = parseInt(SVG.getAttribute("width"), 10);
  const HEIGHT = parseInt(SVG.getAttribute("height"), 10);
  /**
   * My templates are "bespoke".
   * I'm relying on there to be elements with a [data-hsl] attribute.
   * These are the ones that get an inline fill applied to them.
   */
  document
    .querySelectorAll("[data-hsl]")
    .forEach((el) => el.setAttribute("fill", COLOR));
  /**
   * I'm also relying on there being a "Reflection Image" placeholder.
   * This is where we point the SVG image reflection at our compressed image.
   */
  document
    .querySelector("#reflectionImage")
    .setAttribute("xlink:href", TMP_IMAGE_PATH);
  // If we don't have a reflection to show, we can remove the element.
  if (!image) document.querySelector("#reflectionImage").remove();
  /**
   * Set the OG card title. Again, this is based on a certain class/attribute.
   */
  document.querySelector("[data-og-title]").innerHTML = title;
  // Write this SVG to the tmp folder
  fs.writeFileSync(TMP_SVG_PATH, SVG.outerHTML, "utf-8");
  /**
   * This is where we grab a "snap" of that PNG.
   * Using Puppeteer, we can take a screenshot of the SVG using
   * headless Chromium.
   */
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`file://${TMP_SVG_PATH}`);
  await page.setViewport({ width: WIDTH, height: HEIGHT });
  // Output the screenshot to either the given path or the default.
  await page.screenshot({
    path: output,
    type: "png",
    fullPage: true,
  });
  // Close the instance
  await page.close();
  await browser.close();
  // Remove the temporary files
  if (fs.existsSync(TMP_IMAGE_PATH)) await fs.promises.unlink(TMP_IMAGE_PATH);
  if (fs.existsSync(TMP_SVG_PATH)) await fs.promises.unlink(TMP_SVG_PATH);
  LOG.info(`OG Image generated at ${output}`);
};

module.exports = generateOgImage;
