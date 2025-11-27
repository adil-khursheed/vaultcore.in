import { initAuth } from "./index.ts";

export const auth = initAuth({
  baseUrl: "http://localhost:3000",
  productionUrl: "http://localhost:3000",
  googleClientId: "1234567890",
  googleClientSecret: "1234567890",
});
