// Chỉ DOM + localStorage. Logic thuần nằm ở lib/tasks.mjs.
import { addTask, removeTask, toggleTask, filterTasks, summary, clearDone } from './lib/tasks.mjs'

const KEY = 'theodoi.tasks.v1'

let tasks = load()
let filter = 'all'

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(tasks))
}

const form = document.querySelector('#add-form')
const input = document.querySelector('#new-task')
const list = document.querySelector('#task-list')
const summaryEl = document.querySelector('#summary')
const filtersEl = document.querySelector('#filters')
const clearBtn = document.querySelector('#clear-done')

form.addEventListener('submit', (e) => {
  e.preventDefault()
  try {
    tasks = addTask(tasks, input.value, crypto.randomUUID())
    save()
    input.value = ''
    input.removeAttribute('aria-invalid')
  } catch {
    input.setAttribute('aria-invalid', 'true')
  }
  input.focus()
  render()
})

filtersEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-filter]')
  if (!btn) return
  filter = btn.dataset.filter
  render()
})

list.addEventListener('click', (e) => {
  const li = e.target.closest('li[data-id]')
  if (!li) return
  const id = li.dataset.id
  if (e.target.matches('input[type="checkbox"]')) {
    tasks = toggleTask(tasks, id)
    save()
  } else if (e.target.matches('button[data-remove]')) {
    tasks = removeTask(tasks, id)
    save()
  } else {
    return
  }
  render()
})

clearBtn.addEventListener('click', () => {
  tasks = clearDone(tasks)
  save()
  render()
})

function render() {
  const visible = filterTasks(tasks, filter)
  list.textContent = ''
  for (const task of visible) {
    const li = document.createElement('li')
    li.dataset.id = task.id
    li.className = task.done ? 'done' : ''
    const box = document.createElement('input')
    box.type = 'checkbox'
    box.checked = task.done
    const span = document.createElement('span')
    span.textContent = task.text
    const del = document.createElement('button')
    del.type = 'button'
    del.dataset.remove = '1'
    del.textContent = 'Xoá'
    li.append(box, span, del)
    list.append(li)
  }
  for (const btn of filtersEl.querySelectorAll('button[data-filter]')) {
    btn.classList.toggle('active', btn.dataset.filter === filter)
  }
  const s = summary(tasks)
  summaryEl.textContent = 'Đang làm: ' + s.active + ' · Hoàn thành: ' + s.done + ' · Tổng: ' + s.total
  clearBtn.disabled = s.done === 0
}

render()
