import {expect, Page} from '@playwright/test'

// Seeded default admin (api/db/index.js bootstraps this on an empty users
// collection).
export const ADMIN = {username: 'admin', password: 'asdasdasd'}

// Log in through the UI and land on the character list.
export async function login(page: Page, user = ADMIN): Promise<void> {
    await page.goto('/login')
    await page.locator('#name').fill(user.username)
    await page.locator('#password').fill(user.password)
    await page.getByRole('button', {name: 'Login'}).click()
    await page.waitForURL('**/character')
    await expect(page.getByRole('heading', {name: 'Meine Charactere'})).toBeVisible()
}

// Create a fresh character from the list and return its id (from the URL).
export async function createCharacter(page: Page): Promise<string> {
    await page.getByRole('button', {name: /Neuer Charakter/}).click()
    await page.waitForURL(/\/character\/[a-f0-9]+/)
    const match = page.url().match(/\/character\/([a-f0-9]+)/)
    if (!match) throw new Error(`unexpected character url: ${page.url()}`)
    return match[1]
}
