// Logic thuần: không DOM, không localStorage, không side effect.
// Mọi hàm trả về mảng mới — không mutate input.

export function addTask(tasks, text, id = crypto.randomUUID()) {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new TypeError('Nội dung công việc không được để trống')
  }
  return [...tasks, { id, text: text.trim(), done: false }]
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
