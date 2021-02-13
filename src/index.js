const { Command, flags } = require("@oclif/command");
const fs = require("fs");
const generateOgImage = require("./generate.js");

const TEMPLATE_PATH = `${process.cwd()}/templates/og.svg`;

// Used for generating single OG Images with specific titles, images, and colors
class OgGeneratorCommand extends Command {
  async run() {
    const {
      flags: { name, hue, image, title, template, type, output, override },
    } = this.parse(OgGeneratorCommand);
    // Pass through to an actual module
    await generateOgImage(name, title, template, type, image, hue, output, override);
  }
}

OgGeneratorCommand.description = `Describe the command here
...
Use this CLI tool for generating an OG like asset for different platforms using SVG && Puppeteer
`;

OgGeneratorCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({ char: "v" }),
  // add --help flag to show CLI version
  help: flags.help({ char: "h" }),
  name: flags.string({ char: "n", description: "the file name to use" }),
  hue: flags.string({ char: "c", description: "color hue for banner" }),
  image: flags.string({ char: "i", description: "image to use" }),
  title: flags.string({ char: "t", description: "title for card" }),
  template: flags.string({ description: "template for image" }),
  output: flags.string({ char: "o", description: "output path for image" }),
  type: flags.string({ description: "asset type to generate" }),
  override: flags.boolean({
    description: "override any existing asset created",
  }),
};

module.exports = OgGeneratorCommand;
