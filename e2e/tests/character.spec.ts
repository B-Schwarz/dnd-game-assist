import {expect, test} from '@playwright/test'
import {createCharacter, login} from './helpers'

test.describe('character sheet', () => {
    test('creates a character, autosaves edits, and persists across reload', async ({page}) => {
        await login(page)
        await createCharacter(page)

        const name = `E2E Hero ${Date.now()}`
        const nameInput = page.getByPlaceholder(/Character Name|Charaktername/)
        await expect(nameInput).toBeVisible()
        await nameInput.fill(name)

        // ability score → live modifier
        const strScore = page.locator('.dnd-ability').first().locator('.scorebox input')
        await strScore.fill('16')
        await expect(page.locator('.dnd-ability').first().locator('input.mod')).toHaveValue('+3')

        await page.reload()
        await expect(page.getByPlaceholder(/Character Name|Charaktername/)).toHaveValue(name)

        await page.goto('/character')
        await expect(page.getByText(name).first()).toBeVisible()
    })

    test('colour picker reflects the chosen colour, language toggle switches labels, player name persists', async ({page}) => {
        await login(page)
        await createCharacter(page)

        // player name (outside the sheet)
        const player = `Player ${Date.now()}`
        const playerInput = page.locator('.dnd-playername input')
        await playerInput.fill(player)

        // colour picker: choose a colour; the select value reflects it
        const colorSelect = page.locator('.dnd-toolbar select')
        await colorSelect.selectOption({label: 'Red'})
        await expect(colorSelect).toHaveValue('4') // Color.RED

        // EN → DE toggle flips a label
        await expect(page.getByText('Player Name')).toBeVisible()
        await page.getByRole('button', {name: /EN \/ DE/}).click()
        await expect(page.getByText('Name des Spielers')).toBeVisible()

        await page.reload()
        await expect(page.locator('.dnd-playername input')).toHaveValue(player)
        await expect(page.locator('.dnd-toolbar select')).toHaveValue('4')
    })

    test('character list shows the player name and delete removes the character', async ({page}) => {
        await login(page)
        await createCharacter(page)

        const name = `E2E Del ${Date.now()}`
        const player = `Owner ${Date.now()}`
        await page.getByPlaceholder(/Character Name|Charaktername/).fill(name)
        await page.locator('.dnd-playername input').fill(player)
        await page.reload()
        await expect(page.getByPlaceholder(/Character Name|Charaktername/)).toHaveValue(name)

        await page.goto('/character')
        // list row shows the player name
        const row = page.locator('.chakra-button__group', {hasText: name}).first()
        await expect(row).toContainText(player)

        await row.getByRole('button').last().click()
        await page.getByRole('button', {name: 'Löschen'}).click()
        await expect(page.getByText(name)).toHaveCount(0)
    })

    test('keeps a two-column layout at iPad (768px) and iPad mini (744px) widths', async ({page}) => {
        await login(page)
        await createCharacter(page)
        const header = page.locator('.dnd-header')
        await expect(header).toBeVisible()

        const trackCount = () => header.evaluate((el) =>
            getComputedStyle(el).gridTemplateColumns.split(' ').length)

        for (const width of [768, 744]) {
            await page.setViewportSize({width, height: 1024})
            // multi-column grid (collapses to a single 1fr track only at ≤640px)
            expect(await trackCount()).toBeGreaterThan(1)
        }

        // sanity: it does collapse on a phone width
        await page.setViewportSize({width: 600, height: 900})
        expect(await trackCount()).toBe(1)
    })
})
