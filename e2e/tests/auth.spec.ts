import {expect, test} from '@playwright/test'
import {ADMIN, login, logout, NORMAL_USER} from './helpers'

test.describe('authentication & access control', () => {
    test('redirects to the login page when not authenticated', async ({page}) => {
        await page.goto('/character')
        await page.waitForURL('**/login')
        await expect(page.getByRole('heading', {name: 'Login'})).toBeVisible()
    })

    test('rejects wrong credentials with an error message', async ({page}) => {
        await page.goto('/login')
        await page.locator('#name').fill(ADMIN.username)
        await page.locator('#password').fill('wrong-password')
        await page.getByRole('button', {name: 'Login'}).click()
        await expect(page.getByText('Falsches Passwort oder unbekannter Benutzer').first()).toBeVisible()
        await expect(page).toHaveURL(/\/login/)
    })

    test('logs in with the seeded admin and reaches the character list', async ({page}) => {
        await login(page)
        await expect(page).toHaveURL(/\/character/)
        await expect(page.getByRole('heading', {name: 'Meine Charactere'})).toBeVisible()
    })

    test('logout returns to /login and protected routes then redirect', async ({page}) => {
        await login(page)
        await logout(page)
        await expect(page).toHaveURL(/\/login/)
        // session is gone → a protected route bounces back to login
        await page.goto('/character')
        await page.waitForURL('**/login')
    })

    test('a normal user does not see the Admin nav entry and gets no admin data at /admin', async ({page}) => {
        await login(page, NORMAL_USER)
        // The Admin button is only added when /api/me/admin succeeds.
        await expect(page.getByRole('link', {name: 'Admin'})).toHaveCount(0)
        // Direct navigation renders the shell but the admin-only data is denied,
        // so no other users (e.g. the seeded admin) are listed.
        await page.goto('/admin')
        await expect(page.getByText('admin', {exact: true})).toHaveCount(0)
    })

    test('a non-master does not see the initiative master controls', async ({page}) => {
        await login(page, NORMAL_USER)
        await page.goto('/initiative')
        await expect(page.getByRole('button', {name: 'Hinzufügen'})).toHaveCount(0)
        await expect(page.getByRole('button', {name: 'Board Löschen'})).toHaveCount(0)
    })
})
