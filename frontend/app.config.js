const { expo } = require("./app.json");

module.exports = ({ config }) => {
  return {
    ...config,
    ...expo,
    plugins: [
      ...(expo.plugins ?? []),
      ["expo-notifications", { enableBackgroundRemoteNotifications: false }],
    ],
    mods: {
      ...config.mods,
      ios: {
        ...(config.mods?.ios ?? {}),
        entitlements: async (config) => {
          delete config.modResults["aps-environment"];
          return config;
        },
        infoPlist: async (config) => {
          if (Array.isArray(config.modResults.UIBackgroundModes)) {
            config.modResults.UIBackgroundModes = config.modResults.UIBackgroundModes.filter(
              (mode) => mode !== "remote-notification"
            );

            if (config.modResults.UIBackgroundModes.length === 0) {
              delete config.modResults.UIBackgroundModes;
            }
          }

          return config;
        },
      },
    },
  };
};
