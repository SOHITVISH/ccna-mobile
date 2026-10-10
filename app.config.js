const app = require("./app.json").expo;

module.exports = () => ({
  ...app,
  experiments: {
    ...app.experiments,
    ...(process.env.GITHUB_PAGES === "true" ? { baseUrl: "/ccna-mobile" } : {}),
  },
});
