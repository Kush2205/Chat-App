/** @type {import('tailwindcss').Config} */

const config = require("@repo/tw-config/tw-config");

module.exports = {
    ...config,
      content : ["./src/**/*.tsx", "../../packages/ui/src/**/*.tsx"]
}