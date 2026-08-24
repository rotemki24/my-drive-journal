const storageKey = 'dailyflow-data-v1'
let data = JSON.parse(localStorage.getItem(storageKey) || '{"schedules":[],"completions":{},"metrics":{}}')
let selectedDate = new Date()
let adding = false
const weekdayNames = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
const root = document.querySelector('#root')

// Keep dates in the device's local calendar. Using toISOString() here can shift
// the day backwards for time zones east of UTC, including Israel.
const dayKey = (date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
const save = () => localStorage.setItem(storageKey, JSON.stringify(data))
const escape = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]))
const todayText = (date) => new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }).format(date)
function weekDates() { const sunday = new Date(selectedDate); sunday.setDate(selectedDate.getDate() - selectedDate.getDay()); return Array.from({ length: 7 }, (_, i) => { const day = new Date(sunday); day.setDate(sunday.getDate() + i); return day }) }
function metric() { return data.metrics[dayKey(selectedDate)] || { steps: 0, water: 0, calories: 0 } }
function activeTasks() { const key = dayKey(selectedDate); return data.schedules.flatMap((schedule) => (schedule.kind === 'fixed' ? schedule.weekdays.includes(selectedDate.getDay()) : schedule.date === key) ? schedule.tasks.map((task) => ({ ...task, scheduleName: schedule.name })) : []) }

function render() {
  const key = dayKey(selectedDate), tasks = activeTasks(), completed = data.completions[key] || [], values = metric()
  const selectedLabel = new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: 'numeric', month: 'numeric' }).format(selectedDate)
  root.innerHTML = `<main class="app-shell">
    <header><div class="calendar-mark">▦</div><div><p class="eyebrow">הלוז שלי</p><h1>${todayText(selectedDate)}</h1></div></header>
    <div class="week-strip">${weekDates().map((date, i) => `<button class="day-pill ${dayKey(date) === key ? 'active' : ''}" data-date="${dayKey(date)}"><span>${weekdayNames[i]}</span><strong>${date.getDate()}.${date.getMonth() + 1}</strong></button>`).join('')}</div>
    <section class="schedule-card">${tasks.length ? `<div class="section-title"><button class="icon-button" data-action="open-modal">＋</button><div><p>${completed.length} מתוך ${tasks.length} הושלמו · ${selectedLabel}</p><h2>המשימות שלי</h2></div></div><div class="task-list">${tasks.map((task) => `<button class="task-row ${completed.includes(task.id) ? 'done' : ''}" data-task="${task.id}"><span class="check">${completed.includes(task.id) ? '✓' : ''}</span><span><small>${escape(task.scheduleName)}</small>${escape(task.title)}</span></button>`).join('')}</div>` : `<div class="empty-state"><div class="empty-icon">▦</div><p class="selected-day-label">הלוז של ${selectedLabel}</p><h2>עדיין אין לוז ליום הזה</h2><p>בוא נוסיף משהו קטן ונצא לדרך.</p><button class="primary-button" data-action="open-modal">＋ הוסף לוז</button></div>`}</section>
    <section class="tracking"><div class="section-title"><div><h2>המעקב שלי</h2><p>מילוי ידני ליום הנבחר</p></div></div><div class="metric-grid">
      <article class="metric-card"><div class="metric-icon">◌</div><h3>צעדים</h3><input class="steps-input" data-metric="steps" inputmode="numeric" value="${values.steps}"><span>מתוך 10,000</span></article>
      ${metricCard('מים', '◒', (values.water / 1000).toFixed(1) + ' ל׳', '3 ל׳', 'water', 250)}
      ${metricCard('קלוריות', '♨', values.calories.toLocaleString('he-IL'), '2,000', 'calories', 100)}
    </div></section><footer><span>לוז</span><strong>היום</strong></footer>${adding ? modal() : ''}</main>`
  root.querySelectorAll('[data-date]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedDate = new Date(`${button.dataset.date}T12:00:00`)
      render()
    })
  })
}
function metricCard(title, icon, value, goal, field, increment) { return `<article class="metric-card"><div class="metric-icon">${icon}</div><h3>${title}</h3><strong>${value}</strong><span>מתוך ${goal}</span><div class="metric-actions"><button data-metric-action="${field}:-${increment}">−</button><button data-metric-action="${field}:${increment}">＋</button></div></article>` }
function modal() { return `<div class="backdrop"><section class="modal"><div class="modal-heading"><button class="close" data-action="close-modal">×</button><h2>הוסף לוז</h2></div><label>שם הלוז<input id="schedule-name" autofocus placeholder="למשל: שגרת בוקר"></label><div class="choice-grid"><button class="choice active" data-kind="fixed">לוז קבוע</button><button class="choice" data-kind="specific">יום ספציפי</button></div><div id="schedule-date-options"></div><div class="field-group"><span>משימות</span><div class="task-adder"><input id="new-task" placeholder="משימה חדשה"><button data-action="add-task">הוסף</button></div><ul class="draft-tasks" id="draft-tasks"></ul></div><button class="primary-button" data-action="save-schedule">שמור לוז</button></section></div>` }
let draftTasks = [], selectedKind = 'fixed', selectedDays = []
function renderDateOptions() { const target = document.querySelector('#schedule-date-options'); if (!target) return; target.innerHTML = selectedKind === 'fixed' ? `<div class="field-group"><span>באילו ימים?</span><div class="weekday-picker">${weekdayNames.map((name, i) => `<button class="${selectedDays.includes(i) ? 'active' : ''}" data-weekday="${i}">${name}</button>`).join('')}</div></div>` : `<label>תאריך<input id="specific-date" type="date" value="${dayKey(selectedDate)}"></label>` }
function renderDraftTasks() { const list = document.querySelector('#draft-tasks'); if (list) list.innerHTML = draftTasks.map((task) => `<li><button data-remove-task="${task.id}">×</button>${escape(task.title)}</li>`).join('') }

document.addEventListener('click', (event) => {
  const taskId = event.target.closest('[data-task]')?.dataset.task
  if (taskId) { const key = dayKey(selectedDate), list = data.completions[key] || []; data.completions[key] = list.includes(taskId) ? list.filter((id) => id !== taskId) : [...list, taskId]; save(); render(); return }
  const action = event.target.closest('[data-action]')?.dataset.action
  if (action === 'open-modal') { adding = true; draftTasks = []; selectedKind = 'fixed'; selectedDays = []; render(); renderDateOptions(); return }
  if (action === 'close-modal') { adding = false; render(); return }
  if (action === 'add-task') { const input = document.querySelector('#new-task'), title = input.value.trim(); if (title) { draftTasks.push({ id: crypto.randomUUID(), title }); input.value = ''; renderDraftTasks() } return }
  if (action === 'save-schedule') { const name = document.querySelector('#schedule-name').value.trim(), dateInput = document.querySelector('#specific-date'); if (!name || !draftTasks.length || (selectedKind === 'fixed' && !selectedDays.length)) return alert('צריך שם, לפחות משימה אחת, ויום ללוז קבוע.'); data.schedules.push({ id: crypto.randomUUID(), name, kind: selectedKind, date: dateInput?.value, weekdays: selectedDays, tasks: draftTasks }); save(); adding = false; render(); return }
  const kind = event.target.closest('[data-kind]')?.dataset.kind
  if (kind) { selectedKind = kind; document.querySelectorAll('[data-kind]').forEach((button) => button.classList.toggle('active', button.dataset.kind === kind)); renderDateOptions(); return }
  const weekday = event.target.closest('[data-weekday]')?.dataset.weekday
  if (weekday !== undefined) { const number = Number(weekday); selectedDays = selectedDays.includes(number) ? selectedDays.filter((day) => day !== number) : [...selectedDays, number]; renderDateOptions(); return }
  const remove = event.target.closest('[data-remove-task]')?.dataset.removeTask
  if (remove) { draftTasks = draftTasks.filter((task) => task.id !== remove); renderDraftTasks(); return }
  const metricAction = event.target.closest('[data-metric-action]')?.dataset.metricAction
  if (metricAction) { const [field, amount] = metricAction.split(':'); const key = dayKey(selectedDate), values = metric(); data.metrics[key] = { ...values, [field]: Math.max(0, values[field] + Number(amount)) }; save(); render() }
})
document.addEventListener('input', (event) => { if (event.target.matches('[data-metric="steps"]')) { const key = dayKey(selectedDate), values = metric(); data.metrics[key] = { ...values, steps: Math.max(0, Number(event.target.value) || 0) }; save() } })
render()
