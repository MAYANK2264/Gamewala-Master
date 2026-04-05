// lib/sheets.ts — Inventory app Google Sheets integration

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const SVC_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')!

// ── Auth ─────────────────────────────────────────────────────────
async function getToken(readonly = true): Promise<string> {
  const { GoogleAuth } = await import('google-auth-library')
  const auth = new GoogleAuth({
    credentials: { client_email: SVC_EMAIL, private_key: PRIVATE_KEY },
    scopes: readonly
      ? ['https://www.googleapis.com/auth/spreadsheets.readonly']
      : ['https://www.googleapis.com/auth/spreadsheets'],
  })
  const client = await auth.getClient()
  const res = await client.getAccessToken()
  return res.token!
}

// ── Read ─────────────────────────────────────────────────────────
export async function readSheet(tab: string): Promise<string[][]> {
  try {
    const token = await getToken(true)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(tab)}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
    if (!res.ok) throw new Error(`${res.status}`)
    const data = await res.json()
    return data.values || []
  } catch (e) {
    console.error(`readSheet(${tab}):`, e)
    return []
  }
}

export function toObjects<T>(rows: string[][]): T[] {
  if (rows.length < 2) return []
  const [headers, ...data] = rows
  return data
    .filter(r => r.some(c => c?.trim()))
    .map(r => {
      const obj: Record<string, string> = {}
      headers.forEach((h, i) => { obj[h.trim().toLowerCase().replace(/\s+/g, '_')] = r[i] || '' })
      return obj as unknown as T
    })
}

// ── Append row ────────────────────────────────────────────────────
export async function appendRow(tab: string, values: (string | number | boolean)[]): Promise<boolean> {
  try {
    const token = await getToken(false)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(tab)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [values.map(v => String(v))] }),
    })
    return res.ok
  } catch (e) {
    console.error(`appendRow(${tab}):`, e)
    return false
  }
}

// ── Update a specific row by finding a matching ID ────────────────
export async function updateRowById(tab: string, id: string, newValues: Record<string, string>): Promise<boolean> {
  try {
    const token = await getToken(false)
    // Get current data
    const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(tab)}`
    const readRes = await fetch(readUrl, { headers: { Authorization: `Bearer ${token}` } })
    const readData = await readRes.json()
    const rows: string[][] = readData.values || []
    if (rows.length < 2) return false

    const headers = rows[0]
    const idColIdx = headers.findIndex(h => h.trim().toLowerCase() === 'id')
    const rowIdx = rows.findIndex((r, i) => i > 0 && r[idColIdx] === id)
    if (rowIdx === -1) return false

    // Build updated row
    const updatedRow = [...rows[rowIdx]]
    Object.entries(newValues).forEach(([key, val]) => {
      const colIdx = headers.findIndex(h => h.trim().toLowerCase().replace(/\s+/g, '_') === key)
      if (colIdx !== -1) updatedRow[colIdx] = val
    })

    // Write back
    const range = `${tab}!A${rowIdx + 1}`
    const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=RAW`
    const writeRes = await fetch(writeUrl, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [updatedRow] }),
    })
    return writeRes.ok
  } catch (e) {
    console.error(`updateRowById(${tab}, ${id}):`, e)
    return false
  }
}

// ── Typed helpers ─────────────────────────────────────────────────
import type { NewProduct, SecondHandProduct, RepairJob, User, Task } from '@/types'

export async function getInventoryItems() {
  const [newRows, usedRows, repairRows] = await Promise.all([
    readSheet('NewProducts'),
    readSheet('SecondHand'),
    readSheet('Repairs'),
  ])
  const newProducts = toObjects<NewProduct>(newRows)
  const secondHand = toObjects<SecondHandProduct>(usedRows)
  const repairs = toObjects<RepairJob>(repairRows)
  return { newProducts, secondHand, repairs }
}

export async function getRepairs(): Promise<RepairJob[]> {
  const rows = await readSheet('Repairs')
  return toObjects<RepairJob>(rows).map(r => ({
    ...r,
    statusHistory: (() => { try { return JSON.parse(r.status_history as unknown as string || '[]') } catch { return [] } })(),
  }))
}

export async function getUsers(): Promise<User[]> {
  const rows = await readSheet('Users')
  return toObjects<User>(rows).filter(u => u.active !== false && String(u.active) !== 'FALSE')
}

export async function getTasks(): Promise<Task[]> {
  const rows = await readSheet('Tasks')
  return toObjects<Task>(rows)
}
