const { Command, flags } = require("@oclif/command")
const fs = require("fs")
const generateOgImage = require('../generate-og-image.js')

const TEMPLATE_PATH = `${process.cwd()}/og-generator/og-template.svg`

// Used for generating single OG Images with specific titles, images, and colors
class OgGeneratorCommand extends Command {
  async run() {
    // Use this to do an overwrite
    const { flags: {
      slug,
      hue,
      image,
      title,
      template,
    }} = this.parse(OgGeneratorCommand)
    // Generate a tmp folder
    if (!slug || !title) throw Error('Missing properties for OG card')
    await fs.promises.mkdir(`${process.cwd()}/.tmp`, { recursive: true })
    await fs.promises.mkdir(`${process.cwd()}/src/assets/images/og/`, {
      recursive: true,
    })
    // Load the SVG template file
    const TEMPLATE_FILE = await fs.promises.readFile(template || TEMPLATE_PATH, "utf-8")
    await generateOgImage(slug, title, TEMPLATE_FILE, image, hue === undefined ? Math.floor(Math.random() * 359) : hue, true)
    console.info(`OG Image generated for ${slug}`)
  }
}

OgGeneratorCommand.description = `Describe the command here
...
Extra documentation goes here
`

OgGeneratorCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({ char: "v" }),
  // add --help flag to show CLI version
  help: flags.help({ char: "h" }),
  slug: flags.string({ char: "s", description: "the file slug to use" }),
  hue: flags.string({ char: "c", description: "color hue for banner" }),
  image: flags.string({ char: "i", description: "image to use" }),
  title: flags.string({ char: "t", description: "title for card" }),
  template: flags.string({ description: "template for image" }),
}

module.exports = OgGeneratorCommand
