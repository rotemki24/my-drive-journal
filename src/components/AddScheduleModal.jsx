import { useState } from 'react'
import { weekdayNames } from '../lib/dates'

export function AddScheduleModal({ selectedDate, onClose, onSave }) {
  const [name, setName] = useState('')
  const [kind, setKind] = useState('fixed')
  const [date, setDate] = useState(selectedDate.toISOString().slice(0, 10))
  const [weekdays, setWeekdays] = useState([])
  const [task, setTask] = useState('')
  const [tasks, setTasks] = useState([])

  const addTask = () => {
    const title = task.trim()
    if (!title) return
    setTasks([...tasks, { id: crypto.randomUUID(), title }])
    setTask('')
  }
  const toggleWeekday = (weekday) => setWeekdays(weekdays.includes(weekday) ? weekdays.filter((day) => day !== weekday) : [...weekdays, weekday])
  const canSave = name.trim() && tasks.length && (kind === 'specific' || weekdays.length)
  const save = () => {
    if (!canSave) return
    onSave({ id: crypto.randomUUID(), name: name.trim(), kind, date, weekdays, tasks })
  }

  return <div className="backdrop" role="presentation" onMouseDown={onClose}>
    <section className="modal" role="dialog" aria-modal="true" aria-label="הוסף לוז" onMouseDown={(event) => event.stopPropagation()}>
      <div className="modal-heading"><button className="close" onClick={onClose} aria-label="סגור">×</button><h2>הוסף לוז</h2></div>
      <label>שם הלוז<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="למשל: שגרת בוקר" /></label>
      <div className="choice-grid">
        <button className={kind === 'fixed' ? 'choice active' : 'choice'} onClick={() => setKind('fixed')}>לוז קבוע</button>
        <button className={kind === 'specific' ? 'choice active' : 'choice'} onClick={() => setKind('specific')}>יום ספציפי</button>
      </div>
      {kind === 'fixed' ? <div className="field-group"><span>באילו ימים?</span><div className="weekday-picker">{weekdayNames.map((label, weekday) => <button key={weekday} className={weekdays.includes(weekday) ? 'active' : ''} onClick={() => toggleWeekday(weekday)}>{label}</button>)}</div></div> : <label>תאריך<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>}
      <div className="field-group"><span>משימות</span><div className="task-adder"><input value={task} onChange={(event) => setTask(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addTask()} placeholder="משימה חדשה"/><button onClick={addTask}>הוסף</button></div>
        <ul className="draft-tasks">{tasks.map((item) => <li key={item.id}><button aria-label="מחק משימה" onClick={() => setTasks(tasks.filter((task) => task.id !== item.id))}>×</button>{item.title}</li>)}</ul>
      </div>
      <button className="primary-button" disabled={!canSave} onClick={save}>שמור לוז</button>
    </section>
  </div>
}
