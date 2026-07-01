import {expect, Page, test} from '@playwright/test'
import {apiContext, login, MASTER_USER} from './helpers'

// Create a monster through the UI and give it a unique name.
async function createNamedMonster(page: Page, name: string): Promise<void> {
    await page.goto('/monster')
    await page.getByRole('button', {name: 'add new monster'}).click()
    const item = page.locator('.chakra-accordion__item').first()
    await item.locator('.chakra-accordion__button').click()
    await item.getByRole('button', {name: 'edit'}).click()
    await item.locator('input').first().fill(name) // Name field is the first input
    await item.getByRole('button', {name: 'save'}).click()
    await expect(page.getByText(name + ' wurde gespeichert!')).toBeVisible()
}

test.describe('monster & encounter editors', () => {
    // Clean slate: these editors are global, so wipe monsters/encounters/board
    // first to keep "the first/only item" assertions deterministic.
    test.beforeEach(async () => {
        const ctx = await apiContext(MASTER_USER)
        for (const m of await (await ctx.get('/api/monster/list')).json()) {
            await ctx.delete('/api/monster/' + m._id)
        }
        for (const e of await (await ctx.get('/api/encounter/list')).json()) {
            await ctx.delete('/api/encounter/' + e._id)
        }
        await ctx.delete('/api/initiative/player')
        await ctx.dispose()
    })

    test('creates, edits and deletes a monster', async ({page}) => {
        await login(page, MASTER_USER)
        const name = 'Mon ' + Date.now()
        await createNamedMonster(page, name)

        await expect(page.getByText(name, {exact: true})).toBeVisible()

        const item = page.locator('.chakra-accordion__item', {hasText: name})
        await item.getByRole('button', {name: 'delete'}).click()
        const dialog = page.getByRole('alertdialog')
        await expect(dialog).toBeVisible()
        await dialog.getByRole('button', {name: 'Löschen', exact: true}).click()
        await expect(dialog).toBeHidden()
        await page.reload()
        await expect(page.getByText(name, {exact: true})).toHaveCount(0)
    })

    test('builds an encounter from a monster and adds it to the initiative board', async ({page}) => {
        await login(page, MASTER_USER)

        const ctx = await apiContext(MASTER_USER)
        await ctx.delete('/api/initiative/player')
        await ctx.dispose()

        const monName = 'EncMon ' + Date.now()
        await createNamedMonster(page, monName)

        await page.goto('/encounter')
        await page.getByRole('button', {name: 'add new encounter'}).click()
        const enc = page.locator('.chakra-accordion__item').first()
        await enc.locator('.chakra-accordion__button').click()
        await enc.getByRole('button', {name: 'edit'}).click()
        const encName = 'Enc ' + Date.now()
        await enc.locator('input').first().fill(encName)
        await enc.locator('select').selectOption({label: monName})
        await enc.locator('input[type="number"]').last().fill('2')
        await enc.getByRole('button', {name: 'add new monster'}).click()
        await enc.getByRole('button', {name: 'save'}).click()

        await page.goto('/initiative')
        await page.getByRole('button', {name: 'Hinzufügen'}).click()
        await page.getByRole('tab', {name: 'Encounter', exact: true}).click()
        const row = page.locator('tr', {hasText: encName})
        await expect(row).toBeVisible()
        await row.getByRole('button', {name: 'Hinzufügen'}).click()
        await page.getByRole('button', {name: 'Schließen'}).click()

        await expect(page.getByText(monName)).toHaveCount(2)

        const ctx2 = await apiContext(MASTER_USER)
        await ctx2.delete('/api/initiative/player')
        await ctx2.dispose()
    })
})
