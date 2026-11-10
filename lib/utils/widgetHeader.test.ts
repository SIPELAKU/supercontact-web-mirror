import { describe, expect, it } from "vitest";
import { headerIdentity } from "./widgetHeader";

const bot = { botName: "Yoshida", botAvatarUrl: "https://cdn/bot.png", title: "Chat with us" };
const company = { companyName: "PT Toko Tes", companyLogoUrl: "https://cdn/logo.webp" };

describe("headerIdentity", () => {
  it("the bot until an agent takes the chat", () => {
    expect(headerIdentity({ ...bot, ...company, agentConnected: false })).toEqual({
      name: "Yoshida",
      avatarUrl: "https://cdn/bot.png",
      initials: null,
    });
  });

  it("the company once an agent is connected", () => {
    expect(headerIdentity({ ...bot, ...company, agentConnected: true })).toEqual({
      name: "PT Toko Tes",
      avatarUrl: "https://cdn/logo.webp",
      initials: null,
    });
  });

  it("a company without a logo shows its initials", () => {
    expect(headerIdentity({ ...bot, companyName: " PT Toko Tes ", companyLogoUrl: null, agentConnected: true })).toEqual({
      name: "PT Toko Tes",
      avatarUrl: null,
      initials: "PT",
    });
    expect(headerIdentity({ ...bot, companyName: "Solvera", companyLogoUrl: "  ", agentConnected: true }).initials).toBe("S");
    expect(headerIdentity({ ...bot, companyName: "Solvera Indonesia", agentConnected: true }).initials).toBe("SI");
  });

  it("an API without the company keeps the bot", () => {
    expect(headerIdentity({ ...bot, companyName: "", agentConnected: true }).name).toBe("Yoshida");
    expect(headerIdentity({ ...bot, agentConnected: true }).avatarUrl).toBe("https://cdn/bot.png");
  });

  it("a bot without a name or photo falls back to the title and the icon", () => {
    expect(headerIdentity({ title: "Chat with us", botName: " ", botAvatarUrl: "", agentConnected: false })).toEqual({
      name: "Chat with us",
      avatarUrl: null,
      initials: null,
    });
  });
});
