import crypto from "crypto";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

/**
 * Telegram WebApp initData ni verify qiladi
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyTelegramInitData(initData: string): TelegramUser | null {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN topilmadi");
    return null;
  }

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return null;

    // hash ni olib tashlab, qolganlarni sort qilamiz
    params.delete("hash");
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");

    // HMAC-SHA256: secret = HMAC-SHA256("WebAppData", bot_token)
    const secret = crypto
      .createHmac("sha256", "WebAppData")
      .update(token)
      .digest();

    const expectedHash = crypto
      .createHmac("sha256", secret)
      .update(dataCheckString)
      .digest("hex");

    if (expectedHash !== hash) {
      console.warn("initData hash mos kelmadi");
      return null;
    }

    // Muddati o'tganligini tekshirish (1 soat)
    const authDate = Number(params.get("auth_date") ?? 0);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 3600) {
      console.warn("initData muddati o'tgan");
      return null;
    }

    // user ma'lumotlarini parse qilish
    const userStr = params.get("user");
    if (!userStr) return null;

    const user = JSON.parse(userStr) as TelegramUser;
    return user;
  } catch (err) {
    console.error("initData parse xatolik:", err);
    return null;
  }
}
