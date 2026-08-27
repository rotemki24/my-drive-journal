import './styles/background.css'

const root = document.querySelector('#root')
const key = 'my-drive-v2'
const themeKey = 'my-drive-theme'
let s = JSON.parse(localStorage.getItem(key) || '{"cols":[],"days":{}}')
let d = new Date()
let adding = false
let draftSchedule = 'daily'
let draftWeekdays = []
let theme = localStorage.getItem(themeKey) || 'dark'

const weekdays = [['א׳', 'SUN'], ['ב׳', 'MON'], ['ג׳', 'TUE'], ['ד׳', 'WED'], ['ה׳', 'THU'], ['ו׳', 'FRI'], ['ש׳', 'SAT']]
const dk = x => [x.getFullYear(), String(x.getMonth() + 1).padStart(2, '0'), String(x.getDate()).padStart(2, '0')].join('-')
const save = () => localStorage.setItem(key, JSON.stringify(s))
const e = x => String(x || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const value = id => (s.days[dk(d)] || {})[id] || { improve: '', maintain: '', note: '', done: false }
const isVisibleToday = column => column.schedule !== 'specific' || column.weekdays?.includes(d.getDay())
const scheduleLabel = column => column.schedule === 'specific' ? 'SPECIFIC DAYS' : column.schedule === 'fixed' ? 'PERMANENT' : 'DAILY'

function card(c) {
  const v = value(c.id)
  return `<article class="goal-card ${v.done ? 'done' : ''}"><header><button aria-label="Complete column" data-done="${c.id}">${v.done ? '✓' : ''}</button><div><h2>${e(c.title)}</h2><small>${scheduleLabel(c)}</small></div><button aria-label="Delete column" data-delete="${c.id}">×</button></header><label>IMPROVE<textarea data-id="${c.id}" data-field="improve">${e(v.improve)}</textarea></label><label>MAINTAIN<textarea data-id="${c.id}" data-field="maintain">${e(v.maintain)}</textarea></label><label>OPEN NOTE<textarea data-id="${c.id}" data-field="note">${e(v.note)}</textarea></label></article>`
}

function modal() {
  const days = weekdays.map(([hebrew, english], i) => `<button type="button" class="weekday ${draftWeekdays.includes(i) ? 'selected' : ''}" data-weekday="${i}"><b>${hebrew}</b><span>${english}</span></button>`).join('')
  return `<div class="modal"><form><button type="button" aria-label="Close" data-action="close">×</button><small>NEW COLUMN</small><h2>Column title</h2><input autofocus placeholder="Training, Work, Health"><div class="schedule-title">WHEN SHOULD IT APPEAR?</div><div class="schedule-options"><button type="button" class="${draftSchedule === 'daily' ? 'selected' : ''}" data-schedule="daily">DAILY</button><button type="button" class="${draftSchedule === 'fixed' ? 'selected' : ''}" data-schedule="fixed">PERMANENT</button><button type="button" class="${draftSchedule === 'specific' ? 'selected' : ''}" data-schedule="specific">SPECIFIC DAYS</button></div>${draftSchedule === 'specific' ? `<div class="weekdays">${days}</div>` : ''}<button>Create column</button></form></div>`
}

function render() {
  const activeColumns = s.cols.filter(isVisibleToday)
  const done = activeColumns.filter(c => value(c.id).done).length
  root.innerHTML = `<main class="drive-app ${theme === 'light' ? 'light' : ''}"><div class="road-scene"></div><header class="top"><div><b>MY DRIVE</b><small>SCROLL TO DRIVE</small></div><div class="top-actions"><button class="theme-toggle" data-action="theme">${theme === 'light' ? '☾ NIGHT' : '☀ DAY'}</button><span>${done}/${activeColumns.length} DONE</span></div></header><section class="feed">${activeColumns.map(card).join('')}<button class="add" data-action="add">＋ CREATE A COLUMN</button></section><section class="journal"><h2>MONTHLY JOURNAL</h2><div class="grid">${Array.from({ length: 31 }, (_, i) => `<button data-day="${i + 1}">${i + 1}</button>`).join('')}</div></section>${adding ? modal() : ''}</main>`
}

document.addEventListener('click', ev => {
  const action = ev.target.closest('[data-action]')?.dataset.action
  if (action === 'add') { adding = true; draftSchedule = 'daily'; draftWeekdays = []; render(); return }
  if (action === 'close') { adding = false; render(); return }
  if (action === 'theme') { theme = theme === 'light' ? 'dark' : 'light'; localStorage.setItem(themeKey, theme); render(); return }
  const schedule = ev.target.closest('[data-schedule]')?.dataset.schedule
  if (schedule) { draftSchedule = schedule; render(); return }
  const weekday = ev.target.closest('[data-weekday]')?.dataset.weekday
  if (weekday !== undefined) { const n = Number(weekday); draftWeekdays = draftWeekdays.includes(n) ? draftWeekdays.filter(x => x !== n) : [...draftWeekdays, n]; render(); return }
  let id = ev.target.closest('[data-done]')?.dataset.done
  if (id) { put(id, 'done', !value(id).done); render(); return }
  id = ev.target.closest('[data-delete]')?.dataset.delete
  if (id) { s.cols = s.cols.filter(c => c.id !== id); save(); render(); return }
  const day = ev.target.closest('[data-day]')?.dataset.day
  if (day) { d = new Date(d.getFullYear(), d.getMonth(), day); render(); scrollTo({ top: 0, behavior: 'smooth' }) }
})
document.addEventListener('input', ev => { if (ev.target.matches('textarea')) put(ev.target.dataset.id, ev.target.dataset.field, ev.target.value) })
document.addEventListener('submit', ev => {
  if (!ev.target.matches('form')) return
  ev.preventDefault()
  const title = ev.target.querySelector('input').value.trim()
  if (!title || (draftSchedule === 'specific' && !draftWeekdays.length)) return
  s.cols.push({ id: crypto.randomUUID(), title, schedule: draftSchedule, weekdays: draftWeekdays })
  save(); adding = false; render()
})
function put(id, field, v) { const k = dk(d); s.days[k] ||= {}; s.days[k][id] = { ...value(id), [field]: v }; save() }
addEventListener('scroll', () => document.documentElement.style.setProperty('--scroll', scrollY), { passive: true })
render()
