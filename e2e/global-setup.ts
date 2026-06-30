import {request} from '@playwright/test'

// Ensures the stable test users exist before the suite runs: a plain user and a
// master user (provisioned via the admin API). Idempotent across runs.
//
// NB: this file is part of the config import graph, so it deliberately imports
// nothing from ./tests (importing a module inside testDir makes Playwright treat
// the spec files as config-imported and breaks test.describe collection).
const API_URL = process.env.E2E_API_URL || 'http://localhost:4000'
const ADMIN = {username: 'admin', password: 'asdasdasd'}
const NORMAL_USER = {username: 'e2e_user', password: 'e2euserpass'}
const MASTER_USER = {username: 'e2e_master', password: 'e2emasterpass'}

export default async function globalSetup() {
    const ctx = await request.newContext({baseURL: API_URL})
    const login = await ctx.post('/api/auth/login/', {data: {username: ADMIN.username, password: ADMIN.password}})
    if (login.status() !== 200) {
        throw new Error(`global-setup: admin login failed (${login.status()}). Is Mongo seeded?`)
    }

    const ensure = async (name: string, password: string): Promise<string> => {
        const list = async () => (await ctx.get('/api/user')).json()
        let u = (await list()).find((x: any) => x.name === name)
        if (!u) {
            await ctx.post('/api/auth/register', {data: {username: name, password}})
            u = (await list()).find((x: any) => x.name === name)
        }
        return u._id
    }

    await ensure(NORMAL_USER.username, NORMAL_USER.password)
    const masterId = await ensure(MASTER_USER.username, MASTER_USER.password)
    await ctx.put('/api/user/master', {data: {userID: masterId, master: true}})

    await ctx.dispose()
}
