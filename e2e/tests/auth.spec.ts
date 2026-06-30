import {expect, test} from '@playwright/test'
import {ADMIN, login} from './helpers'

test.describe('authentication', () => {
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
        // stays on the login page
        await expect(page).toHaveURL(/\/login/)
    })

    test('logs in with the seeded admin and reaches the character list', async ({page}) => {
        await login(page)
        await expect(page).toHaveURL(/\/character/)
    })
})
