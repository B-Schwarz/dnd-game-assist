// Shared helpers for the API unit/integration suites.

// A minimal Express-style res double that records the status / body the handler
// produced, so synchronous (req, res) handlers can be exercised directly.
const mockRes = () => {
    const res = {}
    res.statusCode = undefined
    res.body = undefined
    res.sendStatus = jest.fn((code) => {
        res.statusCode = code
        return res
    })
    res.send = jest.fn((body) => {
        res.body = body
        return res
    })
    res.status = jest.fn((code) => {
        res.statusCode = code
        return res
    })
    res.json = jest.fn((body) => {
        res.body = body
        return res
    })
    return res
}

// Build a board entry shaped like the front end's Player. `character` is merged
// last so callers can override just hp/maxHp without clobbering the defaults.
const mkPlayer = (o = {}) => ({
    initiative: 0,
    npc: false,
    monster: false,
    hidden: false,
    ...o,
    character: {hp: 10, maxHp: 10, ...(o.character || {})},
})

module.exports = {mockRes, mkPlayer}
