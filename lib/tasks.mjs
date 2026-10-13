// Logic thuần: không DOM, không localStorage, không side effect.
// Mọi hàm trả về mảng mới — không mutate input.

// due hợp lệ: undefined/null/'' (không hẹn) hoặc chuỗi parse được thành Date.
function assertValidDue(due) {
  if (due === undefined || due === null || due === '') return
  if (typeof due !== 'string' || Number.isNaN(new Date(due).getTime())) {
    throw new TypeError('Ngày giờ hẹn không hợp lệ: ' + due)
  }
}

export function addTask(tasks, text, id = crypto.randomUUID(), due = '') {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new TypeError('Nội dung công việc không được để trống')
  }
  assertValidDue(due)
  const task = { id, text: text.trim(), done: false }
  if (due) task.due = due
  return [...tasks, task]
}

export function updateDue(tasks, id, due) {
  assertValidDue(due)
  return tasks.map((t) => {
    if (t.id !== id) return t
    const next = { ...t }
    if (due) next.due = due
    else delete next.due
    return next
  })
}

export function isOverdue(task, now = new Date()) {
  if (task.done || !task.due) return false
  const nowMs = now instanceof Date ? now.getTime() : now
  return new Date(task.due).getTime() < nowMs
}

export function sortTasksByDue(tasks) {
  return [...tasks].sort((a, b) => {
    if (!a.due && !b.due) return 0
    if (!a.due) return 1
    if (!b.due) return -1
    return new Date(a.due).getTime() - new Date(b.due).getTime()
  })
}

export function toggleTask(tasks, id) {
  return tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
}

export function removeTask(tasks, id) {
  return tasks.filter((t) => t.id !== id)
}

export function filterTasks(tasks, filter) {
  if (filter === 'all') return [...tasks]
  if (filter === 'active') return tasks.filter((t) => !t.done)
  if (filter === 'done') return tasks.filter((t) => t.done)
  throw new TypeError('Bộ lọc không hợp lệ: ' + filter)
}

export function summary(tasks) {
  const done = tasks.filter((t) => t.done).length
  return { total: tasks.length, active: tasks.length - done, done }
}

export function clearDone(tasks) {
  return tasks.filter((t) => !t.done)
}
