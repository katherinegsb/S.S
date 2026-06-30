import QRCode from "qrcode";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://s-o7ibr9t2z-pdf-polarizado.vercel.app";

export async function generateQRDataUrl(itemId: string): Promise<string> {
  const url = `${APP_URL}/scan?id=${itemId}`;
  return QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: { dark: "#0f172a", light: "#ffffff" },
    errorCorrectionLevel: "H",
  });
}

export function getScanUrl(itemId: string): string {
  return `${APP_URL}/scan?id=${itemId}`;
}
