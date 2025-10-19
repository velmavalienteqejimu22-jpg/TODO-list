'use strict';

console.log('✅ app loaded');

// ========== 元素获取 ==========
const form = document.getElementById('add-form');
const input = document.getElementById('todo-input');
const dateInput = document.getElementById('todo-date');
const list = document.getElementById('todo-list');

// 日期过滤按钮
const searchTodayBtn = document.getElementById('searchTodayBtn');
const searchTomorrowBtn = document.getElementById('searchTomorrowBtn');
const searchWeekBtn = document.getElementById('searchWeekBtn');
const searchMonthBtn = document.getElementById('searchMonthBtn');
const pastBtn = document.querySelector('a[data-range="past"]');

// ========== 本地存储 ==========
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ========== 渲染任务 ==========
function renderTasks(filter = 'all') {
  list.innerHTML = '';
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  tasks.forEach((task, index) => {
    // 日期过滤逻辑
    if (filter !== 'all') {
      const taskDate = new Date(task.date);
      if (filter === 'today' && task.date !== todayStr) return;
      if (filter === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        if (task.date !== tomorrow.toISOString().split('T')[0]) return;
      }
      if (filter === 'week') {
        const weekAgo = new Date();
        const weekLater = new Date();
        weekAgo.setDate(today.getDate() - 7);
        weekLater.setDate(today.getDate() + 7);
        if (taskDate < weekAgo || taskDate > weekLater) return;
      }
      if (filter === 'month') {
        const monthAgo = new Date();
        const monthLater = new Date();
        monthAgo.setMonth(today.getMonth() - 1);
        monthLater.setMonth(today.getMonth() + 1);
        if (taskDate < monthAgo || taskDate > monthLater) return;
      }
      if (filter === 'past' && taskDate >= today) return;
    }

    // 创建任务项
    const li = document.createElement('li');
    li.classList.add('todo-item');
    if (task.completed) li.classList.add('completed');

    // 文本区域
    const span = document.createElement('span');
    span.classList.add('value');
    span.textContent = `${task.text} (${task.date || '无日期'})`;

    // ✅ 双击编辑
    span.addEventListener('dblclick', () => {
      const inputEdit = document.createElement('input');
      inputEdit.type = 'text';
      inputEdit.value = task.text;
      li.replaceChild(inputEdit, span);
      inputEdit.focus();

      inputEdit.addEventListener('blur', () => {
        task.text = inputEdit.value.trim();
        saveTasks();
        renderTasks(filter);
      });

      inputEdit.addEventListener('keydown', e => {
        if (e.key === 'Enter') inputEdit.blur();
      });
    });

    // ✅ 完成按钮
    const comBtn = document.createElement('button');
    comBtn.textContent = task.completed ? '已完成' : '完成';
    comBtn.classList.add('complete-btn');
    comBtn.addEventListener('click', () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks(filter);
    });

    // ✅ 删除按钮
    const delBtn = document.createElement('button');
    delBtn.textContent = '删除';
    delBtn.classList.add('delete-btn');
    delBtn.addEventListener('click', () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks(filter);
    });

    li.appendChild(span);
    li.appendChild(comBtn);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// ========== 添加任务 ==========
console.log(form, input, dateInput, list); // Debug 输出
form.addEventListener('submit', e => {
  e.preventDefault();
  const value = input.value.trim();
  const date = dateInput.value || new Date().toISOString().split('T')[0];
  if (!value) return;
  console.log('即将添加', value, date);   // Debug 输出

  const newTask = {
    text: value,
    date: date,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  input.value = '';
  dateInput.value = '';
});

// ========== 搜索任务 ==========
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', function () {
  const keyword = this.value.trim().toLowerCase();
  const items = list.getElementsByTagName('li');

  for (let li of items) {
    const text = li.querySelector('.value')?.textContent.toLowerCase() || '';
    li.style.display = text.includes(keyword) ? '' : 'none';
  }
});

// ========== 日期过滤按钮绑定 ==========
searchTodayBtn.addEventListener('click', () => renderTasks('today'));
searchTomorrowBtn.addEventListener('click', () => renderTasks('tomorrow'));
searchWeekBtn.addEventListener('click', () => renderTasks('week'));
searchMonthBtn.addEventListener('click', () => renderTasks('month'));
pastBtn.addEventListener('click', () => renderTasks('past'));

// ========== 初始化 ==========
renderTasks();
