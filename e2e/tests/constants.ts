// Plain constants with no @playwright/test import, so they can be shared by
// both the spec helpers and global-setup without pulling the test runtime into
// the config phase (which breaks test.describe collection).

export const ADMIN = {username: 'admin', password: 'asdasdasd'}
export const NORMAL_USER = {username: 'e2e_user', password: 'E2eUser!Pass1'}
export const MASTER_USER = {username: 'e2e_master', password: 'E2eMaster!Pass1'}

// The API runs on 4000; the web app (baseURL) on 3000.
export const API_URL = process.env.E2E_API_URL || 'http://localhost:4000'
