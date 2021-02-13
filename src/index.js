const { Command, flags } = require("@oclif/command");
const generateOgImage = require("./generate.js");

// Used for generating single OG Images with specific titles, images, and colors
class OgGeneratorCommand extends Command {
  async run() {
    const {
      flags: { hue, image, title, template, type, output, override },
    } = this.parse(OgGeneratorCommand);
    // Pass through to an actual module
    await generateOgImage(title, template, type, image, hue, output, override);
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
