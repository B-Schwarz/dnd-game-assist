import {APIRequestContext, expect, Page, test} from '@playwright/test'
import {apiContext, login, MASTER_USER, NORMAL_USER} from './helpers'

// ---- board seeding helpers ------------------------------------------------

type SeedEntry = {
    name: string; hp?: number; maxHp?: number; ac?: number; dex?: number; initiative?: number
    npc?: boolean; monster?: boolean; hidden?: boolean; shareHp?: boolean
    shieldActive?: boolean; shield?: number
}

function boardEntry(o: SeedEntry) {
    return {
        character: {
            name: o.name,
            hp: String(o.hp ?? 10), maxHp: String(o.maxHp ?? 10), tempHp: '0',
            ac: String(o.ac ?? 12), dex: String(o.dex ?? 10), speed: '30',
            strSave: '0', dexSave: '0', conSave: '0', intSave: '0', wisSave: '0', chaSave: '0',
        },
        initiative: o.initiative ?? 10,
        isMaster: true, isTurnSet: false, turnId: 0, statusEffects: [],
        id: '', npc: !!o.npc, monster: !!o.monster, hidden: !!o.hidden, shareHp: !!o.shareHp,
        shieldActive: !!o.shieldActive, shield: o.shield ?? 0,
    }
}

async function seedBoard(ctx: APIRequestContext, entries: SeedEntry[]) {
    await ctx.put('/api/initiative', {data: {player: entries.map(boardEntry)}})
}

async function makeChar(ctx: APIRequestContext, name: string, npc = false): Promise<string> {
    const id = (await (await ctx.get('/api/char/new')).json()).id
    await ctx.post('/api/char', {data: {charID: id, character: {name, hp: '10', maxHp: '10', ac: '12', dex: '14'}}})
    if (npc) await ctx.put('/api/char/npc/toggle', {data: {charID: id}})
    return id
}

// Vertical position of a board name, tolerant of the board's flushSync re-render.
async function yOf(page: Page, name: string): Promise<number> {
    const loc = page.getByText(name, {exact: true}).first()
    await expect(loc).toBeVisible()
    let box = await loc.boundingBox()
    for (let i = 0; i < 10 && !box; i++) {
        await page.waitForTimeout(100)
        box = await loc.boundingBox()
    }
    if (!box) throw new Error(`no bounding box for "${name}"`)
    return box.y
}

test.describe('initiative – master', () => {
    let master: APIRequestContext

    test.beforeEach(async () => {
        master = await apiContext(MASTER_USER)
        await master.delete('/api/initiative/player')
    })
    test.afterEach(async () => {
        await master.delete('/api/initiative/player')
        await master.dispose()
    })

    test('adds a player, a monster, an NPC and an encounter from the Add modal', async ({page}) => {
        const admin = await apiContext()
        const pcName = `AddPC ${Date.now()}`
        await makeChar(admin, pcName, false)
        await admin.dispose()

        const npcName = `AddNPC ${Date.now()}`
        await makeChar(master, npcName, true)

        const monName = `AddMon ${Date.now()}`
        await master.get('/api/monster/new')
        const monsters = await (await master.get('/api/monster/list')).json()
        const blank = monsters.find((m: any) => !m.monster.name) || monsters[0]
        await master.put('/api/monster', {data: {charID: blank._id, monster: {...blank.monster, name: monName, stats: {...blank.monster.stats, dex: 14}}}})

        const encName = `AddEnc ${Date.now()}`
        await master.get('/api/encounter/new')
        const encs = await (await master.get('/api/encounter/list')).json()
        const e = encs[encs.length - 1]
        await master.put('/api/encounter', {data: {encounterID: e._id, name: encName, encounter: {encounter: [{monster: blank._id, amount: 1, hidden: false}]}}})

        await login(page, MASTER_USER)
        await page.goto('/initiative')
        const addFrom = async (tab: string, rowText: string) => {
            await page.getByRole('button', {name: 'Hinzufügen'}).first().click()
            await page.getByRole('tab', {name: tab, exact: true}).click()
            await page.locator('tr', {hasText: rowText}).getByRole('button', {name: 'Hinzufügen'}).click()
            await page.getByRole('button', {name: 'Schließen'}).click()
            await expect(page.getByText('Spieler/Monster hinzufügen')).toHaveCount(0)
        }

        await addFrom('Spieler', pcName)
        await expect(page.getByText(pcName).first()).toBeVisible()
        await addFrom('Monster', monName)
        await expect(page.getByText(monName).first()).toBeVisible()
        await addFrom('NPC', npcName)
        await expect(page.getByText(npcName).first()).toBeVisible()
        await addFrom('Encounter', encName)
        // the encounter contributes one more monster row → two monster rows total
        await expect(page.getByText(monName)).toHaveCount(2)
    })

    test('sorts by initiative and clears the board after confirm', async ({page}) => {
        await seedBoard(master, [
            {name: 'Slow', initiative: 2},
            {name: 'Fast', initiative: 20},
            {name: 'Mid', initiative: 10},
        ])
        await login(page, MASTER_USER)
        await page.goto('/initiative')

        await page.getByRole('button', {name: 'Sortieren'}).click()
        await page.getByRole('dialog').getByRole('button', {name: 'Sortieren'}).click()

        expect(await yOf(page, 'Fast')).toBeLessThan(await yOf(page, 'Mid'))
        expect(await yOf(page, 'Mid')).toBeLessThan(await yOf(page, 'Slow'))

        await page.getByRole('button', {name: 'Board Löschen'}).click()
        await page.getByRole('dialog').getByRole('button', {name: 'Board Löschen'}).click()
        await expect(page.getByText('Fast', {exact: true})).toHaveCount(0)
    })

    test('advances the turn with the arrows and the J/K hotkeys, wrapping the round', async ({page}) => {
        await seedBoard(master, [{name: 'A', initiative: 30}, {name: 'B', initiative: 20}])
        await login(page, MASTER_USER)
        await page.goto('/initiative')
        await expect(page.getByText('Runde: 1')).toBeVisible()

        await page.getByRole('button', {name: 'Nächster'}).click()
        await page.getByRole('button', {name: 'Nächster'}).click()
        await expect(page.getByText('Runde: 2')).toBeVisible()

        await page.locator('body').press('k')
        await page.locator('body').press('j')
        await expect(page.getByText('Runde: 2')).toBeVisible()
    })

    test('auto-opens the current-turn entry panel and moves it on turn change', async ({page}) => {
        await seedBoard(master, [{name: 'First', initiative: 30}, {name: 'Second', initiative: 20}])
        await login(page, MASTER_USER)
        await page.goto('/initiative')

        // turn 0 → the open panel (its "Schild:" control) sits above the Second row
        const beforeSchild = await yOf(page, 'Schild:')
        const secondBefore = await yOf(page, 'Second')
        expect(beforeSchild).toBeLessThan(secondBefore)

        // advancing the turn moves the open panel below the Second row (prev closed)
        await page.getByRole('button', {name: 'Nächster'}).click()
        await expect.poll(async () => (await yOf(page, 'Schild:')) > (await yOf(page, 'Second'))).toBe(true)
    })

    test('shows the AC, shield bonus, and initiative from the entry panel', async ({page}) => {
        // The shield bonus appears behind the AC everywhere (acDisplay). The
        // panel's edit *logic* (applyDamage/acDisplay/formatSave) is covered by
        // initiative-entry.utils.test.ts; here we verify the rendered contract.
        await seedBoard(master, [{name: 'Editable', ac: 14, hp: 8, maxHp: 10, initiative: 13, shieldActive: true, shield: 2}])
        await login(page, MASTER_USER)
        await page.goto('/initiative')
        await expect(page.getByText('Editable', {exact: true}).first()).toBeVisible()

        // AC with shield bonus, and the panel exposes HP / Initiative controls
        await expect(page.getByText('14 (+2)')).toBeVisible()
        const card = page.locator('.init-panel-card', {hasText: 'Werte'})
        await expect(card.getByText('Initiative:', {exact: true})).toBeVisible()
        const initInput = card.getByText('Initiative:', {exact: true})
            .locator('xpath=following::input[@role="spinbutton"][1]')
        await expect(initInput).toHaveValue('13') // seeded initiative shown in the panel
    })

    test('"Leben speichern" pushes board HP to the character sheets', async ({page}) => {
        const charName = `Saver ${Date.now()}`
        const id = await makeChar(master, charName, false)
        await master.put('/api/initiative', {data: {player: [{...boardEntry({name: charName, hp: 3, maxHp: 10}), id}]}})

        await login(page, MASTER_USER)
        await page.goto('/initiative')
        await page.getByRole('button', {name: 'Leben speichern'}).click()
        await expect(page.getByText('Leben gespeichert')).toBeVisible()

        const hp = (await (await master.get(`/api/char/hp/${id}`)).json()).hp
        expect(String(hp)).toBe('3')
    })

    test('dead monster drops to the bottom; dead PC keeps its position', async ({page}) => {
        await seedBoard(master, [
            {name: 'AliveMon', monster: true, npc: true, initiative: 30},
            {name: 'DeadMon', monster: true, npc: true, hp: 0, initiative: 25},
            {name: 'DeadPC', hp: 0, initiative: 20},
            {name: 'AlivePC', initiative: 10},
        ])
        await master.get('/api/initiative/sort') // triggers reorderDeadMonsters
        await login(page, MASTER_USER)
        await page.goto('/initiative')

        // dead monster sank below the live PC
        expect(await yOf(page, 'DeadMon')).toBeGreaterThan(await yOf(page, 'AlivePC'))
        // dead PC keeps its place (not pushed below the dead monster)
        expect(await yOf(page, 'DeadPC')).toBeLessThan(await yOf(page, 'DeadMon'))

        // dead PC row is red (red.100); dead monster row is greyed (#e2e2e2)
        const bgOf = (name: string) => page.getByText(name, {exact: true}).first().evaluate((el) => {
            let n: HTMLElement | null = el as HTMLElement
            while (n) {
                const b = getComputedStyle(n).backgroundColor
                if (b && b !== 'rgba(0, 0, 0, 0)' && b !== 'transparent') return b
                n = n.parentElement
            }
            return ''
        })
        expect(await bgOf('DeadPC')).toBe('rgb(254, 215, 215)')
        expect(await bgOf('DeadMon')).toBe('rgb(226, 226, 226)')
    })

    test('drag-to-reorder changes the order', async ({page}) => {
        await seedBoard(master, [
            {name: 'DragA', initiative: 30},
            {name: 'DragB', initiative: 20},
            {name: 'DragC', initiative: 10},
        ])
        await login(page, MASTER_USER)
        await page.goto('/initiative')
        await expect(page.getByText('DragA', {exact: true}).first()).toBeVisible()
        expect(await yOf(page, 'DragA')).toBeLessThan(await yOf(page, 'DragC'))

        // drag DragA's grip handle down below DragC
        const handle = page.getByLabel('Verschieben').first() // first row = DragA
        const hBox = (await handle.boundingBox())!
        const cBox = (await page.getByText('DragC', {exact: true}).first().boundingBox())!
        await page.mouse.move(hBox.x + hBox.width / 2, hBox.y + hBox.height / 2)
        await page.mouse.down()
        await page.mouse.move(hBox.x + hBox.width / 2, hBox.y + hBox.height / 2 + 8) // exceed 5px activation
        await page.mouse.move(cBox.x + cBox.width / 2, cBox.y + cBox.height / 2, {steps: 12})
        await page.mouse.move(cBox.x + cBox.width / 2, cBox.y + cBox.height + 6, {steps: 6})
        await page.mouse.up()

        // DragA is no longer first (moved down past DragB)
        await expect.poll(async () => (await yOf(page, 'DragA')) > (await yOf(page, 'DragB'))).toBe(true)
    })

    test('highlights the active-turn entry with the gold accent', async ({page}) => {
        await seedBoard(master, [{name: 'TurnA', initiative: 30}, {name: 'TurnB', initiative: 20}])
        await login(page, MASTER_USER)
        await page.goto('/initiative')
        await expect(page.getByText('TurnA', {exact: true}).first()).toBeVisible()

        // walk up from the active entry's name to its row Box and read the
        // turn accent: gold left-border (#d69e2e → rgb(214,158,46)) + cream bg
        // (#fff9e1 → rgb(255,249,225)).
        await expect.poll(async () => page.getByText('TurnA', {exact: true}).first().evaluate((el) => {
            let n: HTMLElement | null = el as HTMLElement
            while (n) {
                const s = getComputedStyle(n)
                if (s.borderLeftColor === 'rgb(214, 158, 46)' || s.backgroundColor === 'rgb(255, 249, 225)') {
                    return `${s.backgroundColor}|${s.borderLeftColor}`
                }
                n = n.parentElement
            }
            return ''
        })).toMatch(/rgb\(255, 249, 225\)|rgb\(214, 158, 46\)/)
    })

    test('a hidden NPC shows the hidden badge and the NPC tag', async ({page}) => {
        await seedBoard(master, [{name: 'HiddenNPC', npc: true, hidden: true, initiative: 15}])
        await login(page, MASTER_USER)
        await page.goto('/initiative')
        await expect(page.getByText('VERSTECKT')).toBeVisible()
        await expect(page.getByText('NPC').first()).toBeVisible()
    })
})

test.describe('initiative – player view', () => {
    let master: APIRequestContext

    test.beforeEach(async () => {
        master = await apiContext(MASTER_USER)
        await master.delete('/api/initiative/player')
    })
    test.afterEach(async () => {
        await master.delete('/api/initiative/player')
        await master.dispose()
    })

    test('hides hidden NPCs and NPC HP from players (unless shared)', async ({page}) => {
        await seedBoard(master, [
            {name: 'VisiblePC', hp: 7, maxHp: 10},
            {name: 'SecretNPC', npc: true, hidden: true},
            {name: 'OpenNPC', npc: true, hp: 4, maxHp: 8, shareHp: false},
        ])
        await login(page, NORMAL_USER)
        await page.goto('/initiative')

        await expect(page.getByText('VisiblePC')).toBeVisible()
        await expect(page.getByText('SecretNPC')).toHaveCount(0)
        await expect(page.getByText('7/10')).toBeVisible()
        await expect(page.getByText('4/8')).toHaveCount(0)
    })

    test('"HP teilen" makes an NPC\'s HP visible to players', async ({page}) => {
        await seedBoard(master, [{name: 'SharedNPC', npc: true, hp: 5, maxHp: 9, shareHp: true}])
        await login(page, NORMAL_USER)
        await page.goto('/initiative')
        await expect(page.getByText('5/9')).toBeVisible()
    })
})
