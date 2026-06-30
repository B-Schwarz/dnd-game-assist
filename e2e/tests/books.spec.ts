import {expect, Page, test} from '@playwright/test'
import {login} from './helpers'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

// A minimal valid PDF.
const PDF_BYTES = '%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n'

function writeTmp(name: string, content: string): string {
    const p = path.join(os.tmpdir(), name)
    fs.writeFileSync(p, content)
    return p
}

async function gotoAdminBooks(page: Page) {
    await login(page)
    await page.goto('/admin')
    await page.getByRole('button', {name: 'Books'}).click()
    await expect(page.getByText('BÜCHER', {exact: true})).toBeVisible()
}

test.describe('books', () => {
    test('uploads a PDF and it appears in the admin list, then deletes it', async ({page}) => {
        await gotoAdminBooks(page)
        const name = `e2e-book-${Date.now()}.pdf`
        const file = writeTmp(name, PDF_BYTES)

        await page.locator('input[type="file"]').setInputFiles(file)
        await expect(page.getByText('Buch hochgeladen')).toBeVisible()
        await expect(page.getByText(name)).toBeVisible()

        // delete it
        const entry = page.locator('div').filter({hasText: name}).filter({has: page.getByRole('button', {name: 'Löschen'})}).last()
        await entry.getByRole('button', {name: 'Löschen'}).click()
        await expect(page.getByText('Buch gelöscht')).toBeVisible()
        await expect(page.getByText(name)).toHaveCount(0)
        fs.unlinkSync(file)
    })

    test('rejects a non-PDF upload with an error toast', async ({page}) => {
        await gotoAdminBooks(page)
        const file = writeTmp(`not-a-book-${Date.now()}.txt`, 'just text')
        await page.locator('input[type="file"]').setInputFiles(file)
        await expect(page.getByText('Nur PDF-Dateien')).toBeVisible()
        fs.unlinkSync(file)
    })

    test('the Books page lists PDFs and opens one in a viewer tab', async ({page}) => {
        // seed a book via the admin uploader first
        await gotoAdminBooks(page)
        const name = `viewer-book-${Date.now()}.pdf`
        const file = writeTmp(name, PDF_BYTES)
        await page.locator('input[type="file"]').setInputFiles(file)
        await expect(page.getByText('Buch hochgeladen')).toBeVisible()

        // capture window.open URLs (a PDF is a download in headless, not a tab)
        await page.addInitScript(() => {
            (window as any).__opened = []
            window.open = ((url?: any) => {
                (window as any).__opened.push(String(url))
                return null
            }) as any
        })
        await page.goto('/books')
        const bookBtn = page.getByRole('button', {name})
        await expect(bookBtn).toBeVisible()

        await bookBtn.click()
        const opened = await page.evaluate(() => (window as any).__opened as string[])
        expect(opened.some((u) => u.includes('/api/books/' + name))).toBe(true)

        // cleanup
        await page.goto('/admin')
        await page.getByRole('button', {name: 'Books'}).click()
        const entry = page.locator('div').filter({hasText: name}).filter({has: page.getByRole('button', {name: 'Löschen'})}).last()
        await entry.getByRole('button', {name: 'Löschen'}).click()
        fs.unlinkSync(file)
    })
})
