import {expect, Locator, Page, test} from '@playwright/test'
import {login} from './helpers'

async function gotoAdminUsers(page: Page) {
    await login(page)
    await page.goto('/admin')
    await expect(page.getByText('REGISTER', {exact: true})).toBeVisible()
}

// Register a user via the admin form; returns its accordion item locator.
async function registerUser(page: Page, name: string): Promise<Locator> {
    await page.getByPlaceholder('Username').fill(name)
    await page.getByPlaceholder('Password', {exact: true}).fill('Str0ngPass2026')
    await page.getByPlaceholder('Password Wiederholen').fill('Str0ngPass2026')
    await page.getByRole('button', {name: 'Register', exact: true}).click()
    const item = page.locator('.chakra-accordion__item', {hasText: name})
    await expect(item).toBeVisible()
    return item
}

test.describe('admin – users', () => {
    test('registers a new user that then appears in the list', async ({page}) => {
        await gotoAdminUsers(page)
        const name = `u${Date.now()}`
        await registerUser(page, name)
        await expect(page.getByRole('button', {name})).toBeVisible()
    })

    test('toggles the master flag and it persists', async ({page}) => {
        await gotoAdminUsers(page)
        const name = `u${Date.now()}`
        const item = await registerUser(page, name)

        await item.getByRole('button', {name}).click()
        // Chakra hides the real input; toggle via the switch label.
        await item.locator('label.chakra-switch', {hasText: 'Master'}).click()
        await expect(item.locator('label.chakra-switch', {hasText: 'Master'}).locator('input')).toBeChecked()

        await page.reload()
        const item2 = page.locator('.chakra-accordion__item', {hasText: name})
        await item2.getByRole('button', {name}).click()
        await expect(item2.locator('label.chakra-switch', {hasText: 'Master'}).locator('input')).toBeChecked()
    })

    test('sets a user password; the user can then log in with it (old fails)', async ({page, browser}) => {
        await gotoAdminUsers(page)
        const name = `u${Date.now()}`
        const item = await registerUser(page, name)

        await item.getByRole('button', {name}).click()
        await item.getByPlaceholder('Neues Passwort').fill('brandNewPass1')
        await item.getByRole('button', {name: 'Setzen'}).click()
        await expect(page.getByText('Passwort gesetzt')).toBeVisible()

        // new password works in a fresh context
        const ctx = await browser.newContext()
        const p2 = await ctx.newPage()
        await login(p2, {username: name, password: 'brandNewPass1'})
        await expect(p2).toHaveURL(/\/character/)
        await ctx.close()

        // old password is rejected
        const ctx2 = await browser.newContext()
        const p3 = await ctx2.newPage()
        await p3.goto('/login')
        await p3.locator('#name').fill(name)
        await p3.locator('#password').fill('password123')
        await p3.getByRole('button', {name: 'Login'}).click()
        await expect(p3.getByText('Falsches Passwort oder unbekannter Benutzer').first()).toBeVisible()
        await ctx2.close()
    })

    test('deletes a user (with confirm) and it disappears from the list', async ({page}) => {
        await gotoAdminUsers(page)
        const name = `u${Date.now()}`
        const item = await registerUser(page, name)

        await item.getByRole('button', {name}).click()
        await item.getByRole('button', {name: 'LÖSCHEN'}).click()
        await page.getByRole('button', {name: 'Löschen', exact: true}).click()

        await expect(page.getByRole('button', {name})).toHaveCount(0)
    })
})
