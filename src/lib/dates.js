export const dayKey = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0, 10)

export const hebrewDate = (date) => new Intl.DateTimeFormat('he-IL', {
  weekday: 'long', day: 'numeric', month: 'long'
}).format(date)

export const daysOfWeek = (selectedDate) => {
  const date = new Date(selectedDate)
  const sundayOffset = date.getDay()
  const sunday = new Date(date)
  sunday.setDate(date.getDate() - sundayOffset)
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(sunday)
    day.setDate(sunday.getDate() + index)
    return day
  })
}

export const weekdayNames = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
