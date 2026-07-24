// Minimum password policy, shared by register / admin-set / self-change.
// Deliberately small: a length floor plus a blocklist of the most common
// passwords. Online guessing is handled by the login rate limiter; this stops
// the trivially-weak passwords an offline crack of a leaked hash tries first.
const MIN_LENGTH = 10

const COMMON = new Set([
    'password', 'password1', 'password12', 'password123', 'passw0rd',
    '1234567890', '123456789', 'qwertyuiop', 'qwerty1234', 'letmein123',
    'iloveyou12', 'admin12345', 'welcome123', 'changeme12', 'baseball12',
    'football12', 'dragon1234', 'sunshine12', 'trustno123', 'monkey1234'
])

const isAcceptablePassword = (pw) => {
    if (typeof pw !== 'string') return false
    if (pw.length < MIN_LENGTH) return false
    if (COMMON.has(pw.toLowerCase())) return false
    return true
}

module.exports = {isAcceptablePassword, MIN_LENGTH}
