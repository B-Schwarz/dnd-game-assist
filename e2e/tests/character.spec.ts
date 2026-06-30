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

        // also set an ability score and check the derived modifier updates live
        const strScore = page.locator('.dnd-ability').first().locator('.scorebox input')
        await strScore.fill('16')
        await expect(page.locator('.dnd-ability').first().locator('input.mod')).toHaveValue('+3')

        // autosave is debounced via React state; reload and confirm it stuck
        await page.reload()
        await expect(page.getByPlaceholder(/Character Name|Charaktername/)).toHaveValue(name)

        // and it shows up in the list (admin sees it in both "own" and "all")
        await page.goto('/character')
        await expect(page.getByText(name).first()).toBeVisible()
    })

    test('deletes a character from the list', async ({page}) => {
        await login(page)
        await createCharacter(page)

        const name = `E2E Disposable ${Date.now()}`
        await page.getByPlaceholder(/Character Name|Charaktername/).fill(name)
        await page.reload()
        await expect(page.getByPlaceholder(/Character Name|Charaktername/)).toHaveValue(name)

        await page.goto('/character')
        const row = page.locator('.chakra-button__group', {hasText: name}).first()
        await expect(row).toBeVisible()
        // the trash button is the last button in the attached group
        await row.getByRole('button').last().click()

        // confirm in the dialog
        await page.getByRole('button', {name: 'Löschen'}).click()

        await expect(page.getByText(name)).toHaveCount(0)
    })
})
