import {expect, test} from '@playwright/test'
import {apiContext, login} from './helpers'

// Mint a throwaway user (via the admin API) so password / account changes don't
// pollute the shared fixtures.
async function freshUser(): Promise<{ username: string; password: string }> {
    const username = `settings_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    const password = 'origPassword1'
    const ctx = await apiContext()
    await ctx.post('/api/auth/register', {data: {username, password}})
    await ctx.dispose()
    return {username, password}
}

test.describe('settings (account self-service)', () => {
    test('changes own password; re-login works with the new one and fails with the old', async ({page, browser}) => {
        const user = await freshUser()
        await login(page, user)
        await page.goto('/settings')

        await page.locator('#pass').fill(user.password)
        await page.locator('#newPass').fill('changedPassword2')
        await page.locator('#newPassRep').fill('changedPassword2')
        await page.getByRole('button', {name: 'Ändern'}).click()
        await expect(page.getByText('Passwort wurde geändert')).toBeVisible()

        // new password works
        const ok = await browser.newContext()
        const p2 = await ok.newPage()
        await login(p2, {username: user.username, password: 'changedPassword2'})
        await expect(p2).toHaveURL(/\/character/)
        await ok.close()

        // old password fails
        const bad = await browser.newContext()
        const p3 = await bad.newPage()
        await p3.goto('/login')
        await p3.locator('#name').fill(user.username)
        await p3.locator('#password').fill(user.password)
        await p3.getByRole('button', {name: 'Login'}).click()
        await expect(p3.getByText('Falsches Passwort oder unbekannter Benutzer').first()).toBeVisible()
        await bad.close()
    })

    test('a wrong current password shows an error and does not change it', async ({page, browser}) => {
        const user = await freshUser()
        await login(page, user)
        await page.goto('/settings')

        await page.locator('#pass').fill('totallyWrong9')
        await page.locator('#newPass').fill('whatever12345')
        await page.locator('#newPassRep').fill('whatever12345')
        await page.getByRole('button', {name: 'Ändern'}).click()
        await expect(page.getByText('Das Passwort ist Falsch!')).toBeVisible()

        // original password still valid
        const ctx = await browser.newContext()
        const p2 = await ctx.newPage()
        await login(p2, user)
        await expect(p2).toHaveURL(/\/character/)
        await ctx.close()
    })

    test('deletes own account and lands back on /login', async ({page}) => {
        const user = await freshUser()
        await login(page, user)
        await page.goto('/settings')

        await page.getByRole('button', {name: 'ACCOUNT LÖSCHEN'}).click()
        await page.getByRole('button', {name: 'Löschen', exact: true}).click()
        await page.waitForURL('**/login')

        // the account is gone — login now fails
        await page.locator('#name').fill(user.username)
        await page.locator('#password').fill(user.password)
        await page.getByRole('button', {name: 'Login'}).click()
        await expect(page.getByText('Falsches Passwort oder unbekannter Benutzer').first()).toBeVisible()
    })

    test('shows the current app version', async ({page}) => {
        await login(page)
        await page.goto('/settings')
        await expect(page.getByText(/Version:\s*2\.0/)).toBeVisible()
    })
})
