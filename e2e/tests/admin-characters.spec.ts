import {expect, Page, test} from '@playwright/test'
import {apiContext, login, NORMAL_USER} from './helpers'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

async function gotoAdminCharacters(page: Page) {
    await login(page)
    await page.goto('/admin')
    await page.getByRole('button', {name: 'Characters'}).click()
    await expect(page.getByText('CHARAKTERE', {exact: true})).toBeVisible()
}

test.describe('admin – characters', () => {
    test('"Alle exportieren" downloads a JSON file with characters + owner', async ({page}) => {
        // ensure at least one character exists
        const ctx = await apiContext()
        await ctx.get('/api/char/new')
        await ctx.dispose()

        await gotoAdminCharacters(page)
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.getByRole('button', {name: 'Alle exportieren'}).click(),
        ])
        expect(download.suggestedFilename()).toMatch(/characters-.*\.json/)
        const file = await download.path()
        const json = JSON.parse(fs.readFileSync(file!, 'utf8'))
        expect(Array.isArray(json)).toBe(true)
        expect(json[0]).toHaveProperty('owner')
    })

    test('per-row Export downloads a single re-importable character file', async ({page}) => {
        const ctx = await apiContext()
        await ctx.get('/api/char/new')
        await ctx.dispose()

        await gotoAdminCharacters(page)
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.locator('table tbody tr').first().getByRole('button', {name: 'Export'}).click(),
        ])
        expect(download.suggestedFilename()).toMatch(/character-.*\.json/)
        const json = JSON.parse(fs.readFileSync((await download.path())!, 'utf8'))
        expect(Array.isArray(json)).toBe(true)
        expect(json).toHaveLength(1)
    })

    test('Import creates the characters as unowned (owner shown as —)', async ({page}) => {
        await gotoAdminCharacters(page)

        const uniqueName = `Imported ${Date.now()}`
        const payload = [{character: {name: uniqueName}, npc: false}]
        const tmp = path.join(os.tmpdir(), `import-${Date.now()}.json`)
        fs.writeFileSync(tmp, JSON.stringify(payload))

        await page.locator('input[type="file"]').setInputFiles(tmp)
        await expect(page.getByText('Import erfolgreich')).toBeVisible()

        const row = page.locator('table tbody tr', {hasText: uniqueName})
        await expect(row).toBeVisible()
        // owner column shows the em dash for an unowned character
        await expect(row).toContainText('—')
        fs.unlinkSync(tmp)
    })

    test('Reassign assigns a PC to a user; an NPC row is not reassignable', async ({page}) => {
        // a PC (unowned, importable) and an NPC
        const pcName = `Reassign PC ${Date.now()}`
        const npcName = `Reassign NPC ${Date.now()}`
        const ctx = await apiContext()
        await ctx.post('/api/char/import', {data: {characters: [{character: {name: pcName}, npc: false}, {character: {name: npcName}, npc: true}]}})
        await ctx.dispose()

        await gotoAdminCharacters(page)

        // PC row: pick the normal user and assign
        const pcRow = page.locator('table tbody tr', {hasText: pcName})
        await pcRow.locator('select').selectOption({label: NORMAL_USER.username})
        await pcRow.getByRole('button', {name: 'Zuweisen'}).click()
        await expect(page.getByText('Charakter zugewiesen')).toBeVisible()
        await expect(page.locator('table tbody tr', {hasText: pcName})).toContainText(NORMAL_USER.username)

        // NPC row: not reassignable
        const npcRow = page.locator('table tbody tr', {hasText: npcName})
        await expect(npcRow).toContainText('nicht zuweisbar')
        await expect(npcRow.getByRole('button', {name: 'Zuweisen'})).toHaveCount(0)
    })
})
