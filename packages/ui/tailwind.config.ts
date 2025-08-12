// import sharedConfig from "@repo/tailwind-config/tailwind.config"
// import type { Config } from "tailwindcss"

// const config: Config = {
//   presets: [sharedConfig],
//   content: [
//     "./src/**/*.{ts,tsx}",
//   ],
// }

// export default config

// import sharedConfig from "@repo/tailwind-config/tailwind.config"

// export default sharedConfig

import sharedConfig from "@repo/tailwind-config/tailwind.config";

export default {
  ...sharedConfig,
  content: [
    "./src/**/*.{ts,tsx}",
    "../../apps/web/**/*.{ts,tsx}",
  ],
};