import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  addTask, removeTask, toggleTask, filterTasks, summary, clearDone,
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
