import { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AddScheduleModal } from './components/AddScheduleModal'
import { WeekStrip } from './components/WeekStrip'
import { dayKey, hebrewDate } from './lib/dates'
import './styles/main.css'
import './styles/background.css'

const STORAGE_KEY = 'dailyflow-data-v1'
const defaultData = { schedules: [], completions: {}, metrics: {} }

function loadData() {
  try { return { ...defaultData, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } } catch { return defaultData }
}

function App() {
  const [data, setData] = useState(loadData)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isAdding, setIsAdding] = useState(false)
  const key = dayKey(selectedDate)
  const metrics = data.metrics[key] || { steps: 0, water: 0, calories: 0 }

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(data)), [data])
  const activeTasks = useMemo(() => data.schedules.flatMap((schedule) => {
    const applies = schedule.kind === 'fixed' ? schedule.weekdays.includes(selectedDate.getDay()) : schedule.date === key
    return applies ? schedule.tasks.map((task) => ({ ...task, scheduleName: schedule.name })) : []
  }), [data.schedules, key, selectedDate])
  const completed = data.completions[key] || []
  const changeMetric = (field, amount) => setData((previous) => ({ ...previous, metrics: { ...previous.metrics, [key]: { ...metrics, [field]: Math.max(0, metrics[field] + amount) } } }))
  const setSteps = (value) => setData((previous) => ({ ...previous, metrics: { ...previous.metrics, [key]: { ...metrics, steps: Math.max(0, Number(value) || 0) } } }))
  const toggleTask = (taskId) => setData((previous) => {
    const next = completed.includes(taskId) ? completed.filter((id) => id !== taskId) : [...completed, taskId]
    return { ...previous, completions: { ...previous.completions, [key]: next } }
  })
  const addSchedule = (schedule) => { setData((previous) => ({ ...previous, schedules: [...previous.schedules, schedule] })); setIsAdding(false) }

  return <main className="app-shell">
    <header><div className="calendar-mark">▦</div><div><p className="eyebrow">הלוז שלי</p><h1>{hebrewDate(selectedDate)}</h1></div></header>
    <WeekStrip selectedDate={selectedDate} onSelect={setSelectedDate} />
    <section className="schedule-card">
      {activeTasks.length ? <><div className="section-title"><button className="icon-button" onClick={() => setIsAdding(true)}>＋</button><div><p>{completed.length} מתוך {activeTasks.length} הושלמו</p><h2>המשימות שלי</h2></div></div><div className="task-list">{activeTasks.map((task) => <button className={`task-row ${completed.includes(task.id) ? 'done' : ''}`} key={task.id} onClick={() => toggleTask(task.id)}><span className="check">{completed.includes(task.id) ? '✓' : ''}</span><span><small>{task.scheduleName}</small>{task.title}</span></button>)}</div></> : <div className="empty-state"><div className="empty-icon">▦</div><h2>עדיין אין לוז להיום</h2><p>בוא נוסיף משהו קטן ונצא לדרך.</p><button className="primary-button" onClick={() => setIsAdding(true)}>＋ הוסף לוז</button></div>}
    </section>
    <section className="tracking"><div className="section-title"><div><h2>המעקב שלי</h2><p>מילוי ידני ליום הנבחר</p></div></div><div className="metric-grid">
      <Metric title="צעדים" icon="◌" value={metrics.steps.toLocaleString('he-IL')} goal="10,000" editable onChange={setSteps} />
      <Metric title="מים" icon="◒" value={(metrics.water / 1000).toFixed(1)} goal="3 ל׳" suffix="ל׳" onAdd={() => changeMetric('water', 250)} onRemove={() => changeMetric('water', -250)} />
      <Metric title="קלוריות" icon="♨" value={metrics.calories.toLocaleString('he-IL')} goal="2,000" onAdd={() => changeMetric('calories', 100)} onRemove={() => changeMetric('calories', -100)} />
    </div></section>
    <footer><span>לוז</span><strong>היום</strong><span>הגדרות</span></footer>
    {isAdding && <AddScheduleModal selectedDate={selectedDate} onClose={() => setIsAdding(false)} onSave={addSchedule} />}
  </main>
}

function Metric({ title, icon, value, goal, suffix = '', editable, onChange, onAdd, onRemove }) {
  return <article className="metric-card"><div className="metric-icon">{icon}</div><h3>{title}</h3>{editable ? <input className="steps-input" inputMode="numeric" value={value.replaceAll(',', '')} onChange={(event) => onChange(event.target.value)} /> : <strong>{value} {suffix}</strong>}<span>מתוך {goal}</span>{!editable && <div className="metric-actions"><button onClick={onRemove}>−</button><button onClick={onAdd}>＋</button></div>}</article>
}

createRoot(document.getElementById('root')).render(<App />)
