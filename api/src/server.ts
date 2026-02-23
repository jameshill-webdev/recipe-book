import "dotenv/config";
import { initialiseApp } from "./app.js";

const app = initialiseApp();
const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});