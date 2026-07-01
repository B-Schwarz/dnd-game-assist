import {APIRequestContext, expect, Page, request} from '@playwright/test'
import {ADMIN, API_URL, MASTER_USER, NORMAL_USER} from './constants'

// Seeded default admin + provisioned test users (see ./constants and
// global-setup.ts). Re-exported for convenience.
export {ADMIN, API_URL, MASTER_USER, NORMAL_USER}

// ---- API helpers (fast data setup, shared cookie jar) ---------------------

export async function apiContext(user = ADMIN): Promise<APIRequestContext> {
    const ctx = await request.newContext({baseURL: API_URL})
    const res = await ctx.post('/api/auth/login/', {data: {username: user.username, password: user.password}})
    if (res.status() !== 200) throw new Error(`API login failed for ${user.username}: ${res.status()}`)
    return ctx
}

export async function findUser(ctx: APIRequestContext, name: string): Promise<any | undefined> {
    const users = await (await ctx.get('/api/user')).json()
    return users.find((u: any) => u.name === name)
}

// Register a user if missing; returns its id. Idempotent.
export async function ensureUser(ctx: APIRequestContext, name: string, password: string): Promise<string> {
    let u = await findUser(ctx, name)
    if (!u) {
        await ctx.post('/api/auth/register', {data: {username: name, password}})
        u = await findUser(ctx, name)
    }
    return u._id
}

export async function setMaster(ctx: APIRequestContext, userID: string, master: boolean): Promise<void> {
    await ctx.put('/api/user/master', {data: {userID, master}})
}

// ---- UI helpers -----------------------------------------------------------

export async function login(page: Page, user = ADMIN): Promise<void> {
    await page.goto('/login')
    await page.locator('#name').fill(user.username)
    await page.locator('#password').fill(user.password)
    await page.getByRole('button', {name: 'Login'}).click()
    await page.waitForURL('**/character')
}

export async function logout(page: Page): Promise<void> {
    await page.getByRole('button', {name: 'Logout'}).click()
    await page.waitForURL('**/login')
}

// Create a fresh character from the list and return its id (from the URL).
export async function createCharacter(page: Page): Promise<string> {
    await page.getByRole('button', {name: /Neuer Charakter/}).click()
    await page.waitForURL(/\/character\/[a-f0-9]+/)
    const match = page.url().match(/\/character\/([a-f0-9]+)/)
    if (!match) throw new Error(`unexpected character url: ${page.url()}`)
    return match[1]
}

export {expect}
