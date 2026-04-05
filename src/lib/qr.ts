// lib/qr.ts — QR code helpers

import { v4 as uuidv4 } from 'uuid'

export function generateProductId(prefix: 'NEW' | 'SH' | 'REP'): string {
  const short = uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase()
  const ts = Date.now().toString(36).toUpperCase().slice(-4)
  return `${prefix}-${ts}${short}`
}

// The QR code encodes a URL that opens the product in the app
export function buildQRPayload(id: string, appUrl: string): string {
  return `${appUrl}/scan?id=${id}`
}

// Generate QR as data URL (client-side using qrcode.react or server-side using qrcode)
export async function generateQRDataUrl(text: string): Promise<string> {
  const QRCode = await import('qrcode')
  return QRCode.toDataURL(text, {
    width: 400,
    margin: 4,
    color: { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel: 'H',
  })
}
