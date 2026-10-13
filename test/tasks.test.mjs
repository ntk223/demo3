import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  addTask, removeTask, toggleTask, filterTasks, summary, clearDone,
  updateDue, isOverdue, sortTasksByDue,
} from '../lib/tasks.mjs'

const seed = () => [
  { id: 'a', text: 'Học Node.js', done: false },
  { id: 'b', text: 'Viết test', done: true },
  { id: 'c', text: 'Deploy demo', done: false },
]

test('addTask: thêm task mới vào cuối, done=false', () => {
  assert.deepEqual(addTask([], 'Học Node.js', 't1'), [
    { id: 't1', text: 'Học Node.js', done: false },
  ])
})

test('addTask: giữ nguyên task cũ, thêm vào cuối', () => {
  const tasks = addTask(seed(), 'Task mới', 'd')
  assert.equal(tasks.length, 4)
  assert.deepEqual(tasks[3], { id: 'd', text: 'Task mới', done: false })
  assert.deepEqual(tasks[0], { id: 'a', text: 'Học Node.js', done: false })
})

test('addTask: cắt khoảng trắng 2 đầu', () => {
  assert.deepEqual(addTask([], '   Uống nước   ', 'x'), [
    { id: 'x', text: 'Uống nước', done: false },
  ])
})

test('addTask: chuỗi rỗng → throw', () => {
  assert.throws(() => addTask([], '', 'x'))
})

test('addTask: chuỗi toàn khoảng trắng → throw', () => {
  assert.throws(() => addTask([], '   ', 'x'))
})

test('addTask: text không phải chuỗi → throw', () => {
  assert.throws(() => addTask([], null, 'x'))
  assert.throws(() => addTask([], 42, 'x'))
})

test('addTask: không mutate mảng gốc', () => {
  const tasks = seed()
  addTask(tasks, 'Mới', 'd')
  assert.deepEqual(tasks, seed())
})

test('toggleTask: false → true', () => {
  const tasks = toggleTask(seed(), 'a')
  assert.equal(tasks[0].done, true)
})

test('toggleTask: true → false', () => {
  const tasks = toggleTask(seed(), 'b')
  assert.deepEqual(tasks.find(t => t.id === 'b'), { id: 'b', text: 'Viết test', done: false })
})

test('toggleTask: task khác giữ nguyên', () => {
  assert.deepEqual(toggleTask(seed(), 'a'), [
    { id: 'a', text: 'Học Node.js', done: true },
    { id: 'b', text: 'Viết test', done: true },
    { id: 'c', text: 'Deploy demo', done: false },
  ])
})

test('toggleTask: id lạ → nội dung không đổi, không mutate', () => {
  const tasks = seed()
  assert.deepEqual(toggleTask(tasks, 'zzz'), seed())
  assert.deepEqual(tasks, seed())
})

test('removeTask: xoá đúng id', () => {
  assert.deepEqual(removeTask(seed(), 'b'), [
    { id: 'a', text: 'Học Node.js', done: false },
    { id: 'c', text: 'Deploy demo', done: false },
  ])
})

test('removeTask: id lạ → không đổi', () => {
  assert.deepEqual(removeTask(seed(), 'zzz'), seed())
})

test('removeTask: mảng rỗng → rỗng', () => {
  assert.deepEqual(removeTask([], 'a'), [])
})

test('removeTask: không mutate mảng gốc', () => {
  const tasks = seed()
  removeTask(tasks, 'a')
  assert.deepEqual(tasks, seed())
})

test('filterTasks: all → toàn bộ', () => {
  assert.deepEqual(filterTasks(seed(), 'all'), seed())
})

test('filterTasks: active → chỉ task chưa xong', () => {
  assert.deepEqual(filterTasks(seed(), 'active'), [
    { id: 'a', text: 'Học Node.js', done: false },
    { id: 'c', text: 'Deploy demo', done: false },
  ])
})

test('filterTasks: done → chỉ task đã xong', () => {
  assert.deepEqual(filterTasks(seed(), 'done'), [
    { id: 'b', text: 'Viết test', done: true },
  ])
})

test('filterTasks: bộ lọc lạ → throw', () => {
  assert.throws(() => filterTasks(seed(), 'abc'))
})

test('summary: đếm tổng / đang làm / hoàn thành', () => {
  assert.deepEqual(summary(seed()), { total: 3, active: 2, done: 1 })
})

test('summary: mảng rỗng → 0/0/0', () => {
  assert.deepEqual(summary([]), { total: 0, active: 0, done: 0 })
})

test('clearDone: bỏ task đã xong, giữ task đang làm', () => {
  assert.deepEqual(clearDone(seed()), [
    { id: 'a', text: 'Học Node.js', done: false },
    { id: 'c', text: 'Deploy demo', done: false },
  ])
})

test('clearDone: không có task đã xong → không đổi, không mutate', () => {
  const tasks = [{ id: 'a', text: 'Học Node.js', done: false }]
  assert.deepEqual(clearDone(tasks), tasks)
  assert.equal(tasks.length, 1)
})

test('clearDone: tất cả đã xong → rỗng', () => {
  assert.deepEqual(clearDone([{ id: 'b', text: 'x', done: true }]), [])
})

// ---- Hẹn lịch hoàn thành (due date) ----

test('addTask: có due → task chứa trường due', () => {
  assert.deepEqual(addTask([], 'Nộp báo cáo', 't1', '2026-10-20T17:00'), [
    { id: 't1', text: 'Nộp báo cáo', done: false, due: '2026-10-20T17:00' },
  ])
})

test('addTask: không truyền due → task không có trường due', () => {
  assert.deepEqual(addTask([], 'Không hẹn', 't2'), [
    { id: 't2', text: 'Không hẹn', done: false },
  ])
})

test('addTask: due null → không có trường due, không throw', () => {
  assert.deepEqual(addTask([], 'Due null', 't3', null), [
    { id: 't3', text: 'Due null', done: false },
  ])
})

test('addTask: due không parse được → throw', () => {
  assert.throws(() => addTask([], 'Due sai', 't4', 'abc'))
})

test('addTask: due không phải chuỗi → throw', () => {
  assert.throws(() => addTask([], 'Due số', 't5', 42))
})

test('updateDue: gán due cho task', () => {
  const tasks = updateDue(seed(), 'a', '2026-12-01T09:00')
  assert.deepEqual(tasks[0], { id: 'a', text: 'Học Node.js', done: false, due: '2026-12-01T09:00' })
})

test('updateDue: do rỗng → xoá trường due', () => {
  const tasks = [{ id: 'a', text: 'Có hẹn', done: false, due: '2026-12-01T09:00' }]
  assert.deepEqual(updateDue(tasks, 'a', ''), [{ id: 'a', text: 'Có hẹn', done: false }])
})

test('updateDue: id lạ → không đổi, không mutate', () => {
  const tasks = seed()
  assert.deepEqual(updateDue(tasks, 'zzz', '2026-12-01T09:00'), seed())
  assert.deepEqual(tasks, seed())
})

test('updateDue: due sai → throw, không mutate', () => {
  const tasks = seed()
  assert.throws(() => updateDue(tasks, 'a', 'khong-hop-le'))
  assert.deepEqual(tasks, seed())
})

test('isOverdue: due quá khứ + chưa xong → true', () => {
  const now = new Date('2026-10-13T09:00:00')
  assert.equal(isOverdue({ id: 'x', text: 'a', done: false, due: '2026-10-13T08:00:00' }, now), true)
})

test('isOverdue: đã hoàn thành → false', () => {
  const now = new Date('2026-10-13T09:00:00')
  assert.equal(isOverdue({ id: 'x', text: 'a', done: true, due: '2026-10-13T08:00:00' }, now), false)
})

test('isOverdue: due tương lai → false', () => {
  const now = new Date('2026-10-13T09:00:00')
  assert.equal(isOverdue({ id: 'x', text: 'a', done: false, due: '2026-10-13T10:00:00' }, now), false)
})

test('isOverdue: không có due → false', () => {
  const now = new Date('2026-10-13T09:00:00')
  assert.equal(isOverdue({ id: 'x', text: 'a', done: false }, now), false)
})

test('isOverdue: due đúng bằng now → false (chưa quá hạn)', () => {
  const now = new Date('2026-10-13T09:00:00')
  assert.equal(isOverdue({ id: 'x', text: 'a', done: false, due: '2026-10-13T09:00:00' }, now), false)
})

test('sortTasksByDue: sắp theo due tăng dần, không due ra cuối', () => {
  const tasks = [
    { id: 'c', text: 'C', done: false, due: '2026-02-01T08:00' },
    { id: 'a', text: 'A', done: false, due: '2026-01-01T08:00' },
    { id: 'b', text: 'B', done: false },
  ]
  assert.deepEqual(sortTasksByDue(tasks).map(t => t.id), ['a', 'c', 'b'])
})

test('sortTasksByDue: không mutate mảng gốc', () => {
  const tasks = [
    { id: 'b', text: 'B', done: false },
    { id: 'a', text: 'A', done: false, due: '2026-01-01T08:00' },
  ]
  sortTasksByDue(tasks)
  assert.deepEqual(tasks.map(t => t.id), ['b', 'a'])
})

test('sortTasksByDue: mảng rỗng → rỗng', () => {
  assert.deepEqual(sortTasksByDue([]), [])
})
