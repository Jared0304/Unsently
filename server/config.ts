import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'

export const PORT = Number(process.env.PORT || 8787)
export const DATA_DIR = path.resolve(process.env.DATA_DIR || 'data')
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads')
export const DB_PATH = path.join(DATA_DIR, 'unsently.db')
export const IS_PROD = process.env.NODE_ENV === 'production'

fs.mkdirSync(UPLOAD_DIR, { recursive: true })
