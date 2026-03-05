export const theme = {
  colors: {
    primary: "#c96442",
    background: "#FAF8F5",
    cardBg: "#FFFFFF",
    text: "#4A3F35",
    mutedText: "#8E8780",
    border: "#E5E0DA",
    mutedBg: "#F0EDE8",
  },
  fonts: {
    sans: 'Geist, Arial, "Helvetica Neue", Helvetica, sans-serif',
  },
  radius: "8px",
  appName: "VaultCore",
  baseUrl:
    process.env.NODE_ENV === "production"
      ? "https://vaultcore.in"
      : "http://localhost:3000",
};
