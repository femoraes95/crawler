const app = require("./index");

const PORT = process.env.PORT || 3535;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}
