import { dayKey, daysOfWeek, weekdayNames } from '../lib/dates'

export function WeekStrip({ selectedDate, onSelect }) {
  return <div className="week-strip" aria-label="בחירת יום">
    {daysOfWeek(selectedDate).map((date, index) => {
      const active = dayKey(date) === dayKey(selectedDate)
      return <button className={`day-pill ${active ? 'active' : ''}`} key={dayKey(date)} onClick={() => onSelect(date)}>
        <span>{weekdayNames[index]}</span>
        <strong>{date.getDate()}.{date.getMonth() + 1}</strong>
      </button>
    })}
  </div>
}
