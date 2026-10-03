import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { FaUpload, FaLink, FaArrowUp, FaArrowDown, FaTrash, FaImages } from 'react-icons/fa'

// ── Shared admin form styling ──────────────────────────────────────
// Inputs used to be bg-slate-700 on a bg-slate-800 panel: one shade apart,
// no border, no label, so forms read as a flat grey block. These classes
// are the corrected version, shared so every admin screen matches.
export const inputCls =
  'admin-field w-full bg-slate-800 border-2 border-slate-500 rounded-lg px-3 py-2.5 text-white ' +
  'placeholder-slate-400 outline-none transition-colors focus:border-yellow-400 ' +
  'focus:ring-2 focus:ring-yellow-400/40 disabled:opacity-50'

export const labelCls = 'block text-sm font-semibold text-slate-200 mb-1.5'

export const panelCls = 'bg-slate-900 border-2 border-slate-700 rounded-xl p-5'

export const btnPrimary =
  'bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-slate-900 font-semibold ' +
  'px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2'

export const btnGhost =
  'bg-slate-700 hover:bg-slate-600 text-white font-semibold px-5 py-2.5 rounded-lg ' +
  'transition-colors flex items-center gap-2 border-2 border-slate-600'

export const btnDanger =
  'bg-slate-800 hover:border-red-400 text-red-400 border-2 border-slate-600 ' +
  'px-3 py-2 rounded-lg transition-colors'

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']

/** Inline success/error banner. Replaces alert() so messages stay on screen. */
export function Notice({ notice }) {
  if (!notice?.text) return null
  const isError = notice.type === 'error'
  return (
    <div className={`px-4 py-3 rounded-lg font-medium border-2 mb-4 ${
      isError
        ? 'bg-red-500/15 text-red-200 border-red-500/50'
        : 'bg-green-500/15 text-green-200 border-green-500/50'
    }`}>
      {notice.text}
    </div>
  )
}

export const safeFileName = (name) =>
  name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').slice(-80)

/**
 * Uploads one file and returns its public URL.
 *
 * The object path is built once and reused for getPublicUrl. These two must
 * match exactly, so this deliberately returns both together rather than
 * letting callers rebuild the path and get a different random name.
 */
export async function uploadFile(bucket, file, prefix = '') {
  if (!file.type.startsWith('image/')) {
    throw new Error(`${file.name} is not an image`)
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`${file.name} is larger than 5MB`)
  }

  const rand = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10)

  const path = `${prefix ? prefix + '/' : ''}${Date.now()}-${rand}-${safeFileName(file.name)}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw new Error(error.message)

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
  return publicUrl
}

/**
 * Image picker supporting both sources the admin asked for: files from this
 * computer (multi-select) and externally hosted URLs.
 *
 * `single` collapses it to one image, for fields like an avatar.
 * `onChange` always receives an array; single mode emits [] or [url].
 */
export default function ImageUploader({
  bucket,
  value = [],
  onChange,
  prefix = '',
  single = false,
  label = 'Image',
  hint = 'JPEG, PNG, WebP or GIF up to 5MB each.',
  id = 'image-uploader'
}) {
  const [urlInput, setUrlInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const add = (url) => onChange(single ? [url] : [...value, url])

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setBusy(true)
    setError('')

    const failures = []
    for (const file of files) {
      try {
        add(await uploadFile(bucket, file, prefix))
      } catch (err) {
        failures.push(err.message)
      }
    }

    if (failures.length) setError(failures.join('; '))
    setBusy(false)
    e.target.value = ''
  }

  const addByUrl = () => {
    const url = urlInput.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url)) {
      return setError('That does not look like a URL. It should start with http:// or https://')
    }
    add(url)
    setUrlInput('')
    setError('')
  }

  const removeAt = (i) => onChange(value.filter((_, idx) => idx !== i))

  const move = (i, dir) => {
    const target = i + dir
    if (target < 0 || target >= value.length) return
    const copy = [...value]
    ;[copy[i], copy[target]] = [copy[target], copy[i]]
    onChange(copy)
  }

  return (
    <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 bg-slate-800/40">
      <label htmlFor={`${id}-file`} className={labelCls}>{label}</label>

      <label htmlFor={`${id}-file`}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-800 border-2 border-slate-500 text-white font-semibold hover:border-yellow-400 hover:bg-slate-700 transition-colors cursor-pointer">
        <FaUpload />
        {busy ? 'Uploading...' : single ? 'Upload from this computer' : 'Upload from this computer (multiple)'}
      </label>
      <input id={`${id}-file`} type="file" accept="image/*" multiple={!single}
        onChange={handleFiles} className="hidden" disabled={busy} />

      <div className="flex gap-2 mt-3">
        <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addByUrl())}
          placeholder="...or paste an image URL and press Add" className={inputCls} />
        <button type="button" onClick={addByUrl}
          className="shrink-0 flex items-center gap-2 bg-slate-700 hover:bg-slate-600 border-2 border-slate-500 text-white font-semibold px-5 rounded-lg transition-colors">
          <FaLink /> Add
        </button>
      </div>

      <p className="text-sm text-slate-400 mt-2">{hint}</p>
      {error && <p className="text-sm text-red-400 mt-2 font-medium">{error}</p>}

      {value.length === 0 ? (
        <p className="text-sm text-slate-400 mt-4 flex items-center gap-2">
          <FaImages /> {single ? 'Nothing selected yet.' : 'No images attached yet.'}
        </p>
      ) : (
        <ul className={`grid gap-3 mt-4 ${single ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          {value.map((src, i) => (
            <li key={src + i} className="bg-slate-900 border-2 border-slate-600 rounded-lg overflow-hidden relative">
              {/* object-contain on a dark backdrop, and a real height. These are
                  mostly screenshots, so object-cover at h-24 cropped them down
                  to an unreadable strip and made them look far smaller than
                  what was actually uploaded. */}
              <img src={src} alt={single ? 'Selected image' : `Image ${i + 1}`}
                className={`w-full object-contain bg-slate-950 ${single ? 'h-64' : 'h-52'}`} />
              {!single && i === 0 && (
                <span className="absolute top-1 left-1 bg-yellow-500 text-slate-900 text-xs font-bold px-1.5 py-0.5 rounded">First</span>
              )}
              <div className="p-1.5 flex items-center justify-between gap-1">
                {!single ? (
                  <>
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                      aria-label="Move earlier" className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300">
                      <FaArrowUp />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1}
                      aria-label="Move later" className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300">
                      <FaArrowDown />
                    </button>
                  </>
                ) : <span />}
                <button type="button" onClick={() => removeAt(i)} aria-label="Remove image"
                  className="p-1 rounded hover:bg-red-500/20 text-red-400">
                  <FaTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * Single non-image file (a report PDF, for example). Separate from
 * ImageUploader because it has no URL fallback and no previews.
 */
export function FileField({ bucket, value, onChange, label, prefix = '', accept, id, hint }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handle = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const rand = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().slice(0, 8)
        : Math.random().toString(36).slice(2, 10)
      const path = `${prefix ? prefix + '/' : ''}${Date.now()}-${rand}-${safeFileName(file.name)}`
      const { error: upErr } = await supabase.storage
        .from(bucket).upload(path, file, { cacheControl: '3600', upsert: false })
      if (upErr) throw new Error(upErr.message)
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
      onChange(publicUrl)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <label htmlFor={id} className={labelCls}>{label}</label>
      <label htmlFor={id}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-800 border-2 border-slate-500 text-white font-semibold hover:border-yellow-400 hover:bg-slate-700 transition-colors cursor-pointer">
        <FaUpload /> {busy ? 'Uploading...' : value ? 'Replace file' : 'Choose file'}
      </label>
      <input id={id} type="file" accept={accept} onChange={handle} className="hidden" disabled={busy} />
      {hint && <p className="text-sm text-slate-400 mt-2">{hint}</p>}
      {error && <p className="text-sm text-red-400 mt-2 font-medium">{error}</p>}
      {value && (
        <a href={value} target="_blank" rel="noopener noreferrer"
          className="text-sm text-slate-300 underline hover:text-yellow-400 mt-2 inline-block truncate max-w-full">
          {value.split('/').pop()}
        </a>
      )}
    </div>
  )
}

/**
 * Turns a public URL back into its storage object path.
 * Only handles the Supabase public storage layout, which is what every
 * upload in the admin uses.
 */
function objectPathFromUrl(url) {
  const match = /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/.exec(url || '')
  return match ? { bucket: match[1], path: decodeURIComponent(match[2]) } : null
}

/**
 * Removes stored files. Dropping a database row does not delete the object,
 * so without this the bucket grows every time content is replaced.
 * Failures are non-fatal: the row is already gone either way.
 */
export async function deleteStoredFiles(urls) {
  const targets = urls.map(objectPathFromUrl).filter(Boolean)
  if (!targets.length) return

  const byBucket = targets.reduce((acc, t) => {
    ;(acc[t.bucket] ||= []).push(t.path)
    return acc
  }, {})

  await Promise.all(
    Object.entries(byBucket).map(([bucket, paths]) =>
      supabase.storage.from(bucket).remove(paths).catch(() => {})
    )
  )
}

/**
 * A field that accepts either an uploaded file or an external URL, bound to
 * one value. AcademicReportsManager already had a URL box *and* an upload
 * button as two unrelated controls for the same column, which made it easy to
 * fill in one and silently save the other.
 */
export function FileOrUrlField({ bucket, value, onChange, label, prefix = '', accept, id, hint }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handle = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const rand = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().slice(0, 8)
        : Math.random().toString(36).slice(2, 10)
      const path = `${prefix ? prefix + '/' : ''}${Date.now()}-${rand}-${safeFileName(file.name)}`
      const { error: upErr } = await supabase.storage
        .from(bucket).upload(path, file, { cacheControl: '3600', upsert: false })
      if (upErr) throw new Error(upErr.message)
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
      onChange(publicUrl)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <label htmlFor={`${id}-url`} className={labelCls}>{label}</label>

      <label htmlFor={id}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-800 border-2 border-slate-500 text-white font-semibold hover:border-yellow-400 hover:bg-slate-700 transition-colors cursor-pointer">
        <FaUpload /> {busy ? 'Uploading...' : 'Upload a file from this computer'}
      </label>
      <input id={id} type="file" accept={accept} onChange={handle} className="hidden" disabled={busy} />

      <div className="flex gap-2 mt-2">
        <input id={`${id}-url`} type="url" value={value || ''}
          onChange={e => onChange(e.target.value)} className={inputCls}
          placeholder="...or paste a link to the file" />
        {value && (
          <button type="button" onClick={() => onChange('')} aria-label="Clear file"
            className="shrink-0 px-4 rounded-lg bg-slate-800 hover:bg-red-500/20 border-2 border-slate-600 text-red-400 font-semibold">
            <FaTrash />
          </button>
        )}
      </div>

      {hint && <p className="text-sm text-slate-400 mt-2">{hint}</p>}
      {error && <p className="text-sm text-red-400 mt-2 font-medium">{error}</p>}
      {value && (
        <a href={value} target="_blank" rel="noopener noreferrer"
          className="text-sm text-slate-300 underline hover:text-yellow-400 mt-2 inline-block truncate max-w-full">
          {value.split('/').pop()}
        </a>
      )}
    </div>
  )
}

/**
 * Picks only the columns a form owns.
 *
 * Several managers used to copy a whole database row into form state and
 * send it straight back on update, which pushed id, created_at and other
 * server-owned columns back into the payload. Pass the column list and the
 * row is rebuilt from scratch instead.
 */
export const pickFields = (row, fields) =>
  fields.reduce((acc, key) => {
    if (row[key] !== undefined) acc[key] = row[key]
    return acc
  }, {})