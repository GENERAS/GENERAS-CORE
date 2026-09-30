/**
 * Tracking tokens for project inquiries.
 *
 * Inquiries used to be looked up by email address with no authentication,
 * which meant anyone could read someone else's project details by typing
 * their address. The anon key in the browser bundle is public, so email
 * could not be treated as a secret. A random token can be: it is generated
 * once, handed to the person who submitted the form, and never guessable.
 *
 * Row level security relies on this: project_inquiries has no anonymous
 * SELECT policy at all, so a token is the only way to read a row outside
 * the admin dashboard. See database-inquiries-tracking-token-rls.sql.
 */

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // no I/L/O/0/1, so it survives being read aloud or retyped

const randomBytes = (length) => {
  const values = new Uint32Array(length)

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(values)
  } else {
    for (let i = 0; i < length; i++) values[i] = Math.floor(Math.random() * 0xffffffff)
  }

  return values
}

/**
 * Builds a token in the form TRK-XXXXX-XXXXX-XXXXX.
 * 15 characters drawn from a 32-symbol alphabet is 75 bits of entropy,
 * which is far more than needed to make guessing worthwhile.
 */
export const generateTrackingToken = () => {
  const values = randomBytes(15)
  let token = 'TRK-'

  for (let i = 0; i < 15; i++) {
    if (i > 0 && i % 5 === 0) token += '-'
    token += ALPHABET[values[i] % ALPHABET.length]
  }

  return token
}

/** Tolerant of how the token was pasted: trims, uppercases, drops spaces. */
export const normalizeTrackingToken = (value) =>
  (value || '').trim().toUpperCase().replace(/\s+/g, '')
