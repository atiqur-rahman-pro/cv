// app.js (module)
// Features: add/edit/delete, complete toggle, due date, priority, tags, sort/filter, import/export, localStorage

const STORAGE_KEY = 'todoApp.todos.v1';

// Elements
const addForm = document.getElementById('addForm');
const newTodo = document.getElementById('newTodo');
const priorityInput = document.getElementById('priority');
const dueDateInput = document.getElementById('dueDate');
const tagsInput = document.getElementById('tagsInput');
const listEl = document.getElementById('list');
const countEl = document.getElementById('count');
const filters = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const emptyEl = document.getElementById('empty');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const sortSelect = document.getElementById('sortSelect');
const tagFilter = document.getElementById('tagFilter');

let todos = [];
let activeFilter = 'all';

// Utilities
const uid = () => crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    todos = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load todos', e);
    todos = [];
  }
};

function formatDateISO(d) { if (!d) return ''; try { return new Date(d).toISOString().slice(0,10);} catch(e){return ''} }

function render() {
  listEl.innerHTML = '';
  // apply filters
  const tagFilterVal = (tagFilter.value || '').trim().toLowerCase();

  let filtered = todos.filter(t => {
    if (activeFilter === 'active') if (t.completed) return false;
    if (activeFilter === 'completed') if (!t.completed) return false;
    if (tagFilterVal) {
      const tags = (t.tags || []).map(x => x.toLowerCase());
      if (!tags.some(x => x.includes(tagFilterVal))) return false;
    }
    return true;
  });

  // sort
  const sort = sortSelect.value || 'createdDesc';
  filtered.sort((a,b) => {
    if (sort === 'createdDesc') return (b.createdAt||'').localeCompare(a.createdAt||'');
    if (sort === 'createdAsc') return (a.createdAt||'').localeCompare(b.createdAt||'');
    if (sort === 'dueAsc') return (a.dueDate||'').localeCompare(b.dueDate||'');
    if (sort === 'dueDesc') return (b.dueDate||'').localeCompare(a.dueDate||'');
    if (sort === 'priorityDesc') return priorityRank(b.priority) - priorityRank(a.priority);
    return 0;
  });

  if (filtered.length === 0) emptyEl.hidden = false; else emptyEl.hidden = true;

  for (const todo of filtered) {
    const item = document.createElement('div');
    item.className = 'todo';
    item.setAttribute('data-id', todo.id);

    const left = document.createElement('div'); left.className = 'left';

    const chk = document.createElement('button');
    chk.className = 'chk' + (todo.completed ? ' checked' : '');
    chk.setAttribute('aria-label', todo.completed ? 'Mark as not completed' : 'Mark as completed');
    chk.addEventListener('click', () => toggleComplete(todo.id));
    chk.innerHTML = todo.completed ? '✓' : '';

    const titleWrap = document.createElement('div');
    titleWrap.style.display = 'flex';
    titleWrap.style.flexDirection = 'column';

    const title = document.createElement('div');
    title.className = 'todo-title' + (todo.completed ? ' completed' : '');
    title.textContent = todo.title;
    title.tabIndex = 0;

    const meta = document.createElement('div');
    meta.className = 'small';
    const parts = [];
    if (todo.dueDate) parts.push('Due: ' + todo.dueDate);
    if (todo.priority) parts.push('Priority: ' + capitalize(todo.priority));
    if (todo.tags && todo.tags.length) parts.push('Tags: ' + todo.tags.join(', '));
    meta.textContent = parts.join(' • ');

    titleWrap.appendChild(title);
    titleWrap.appendChild(meta);

    left.appendChild(chk);
    left.appendChild(titleWrap);

    const actions = document.createElement('div'); actions.className = 'actions';

    const editBtn = document.createElement('button'); editBtn.className='icon-btn'; editBtn.innerHTML='✎'; editBtn.title='Edit'; editBtn.addEventListener('click',()=>startEdit(todo.id));
    const delBtn = document.createElement('button'); delBtn.className='icon-btn'; delBtn.innerHTML='🗑'; delBtn.title='Delete'; delBtn.addEventListener('click',()=>removeTodo(todo.id));

    actions.appendChild(editBtn); actions.appendChild(delBtn);

    // priority badge
    if (todo.priority) {
      const p = document.createElement('div'); p.className = 'priority-'+todo.priority; p.style.marginLeft='8px'; p.textContent = todo.priority.toUpperCase();
      actions.insertBefore(p, editBtn);
    }

    // tags
    if (todo.tags && todo.tags.length) {
      const tagsWrap = document.createElement('div'); tagsWrap.style.display='flex'; tagsWrap.style.gap='6px'; tagsWrap.style.marginTop='6px';
      for (const t of todo.tags) { const sp = document.createElement('span'); sp.className='tag'; sp.textContent = t; tagsWrap.appendChild(sp); }
      titleWrap.appendChild(tagsWrap);
    }

    item.appendChild(left);
    item.appendChild(actions);
    listEl.appendChild(item);
  }

  updateCount();
}

function priorityRank(p) { if (!p) return 1; if (p==='high') return 3; if (p==='medium') return 2; return 1; }
function capitalize(s) { return s ? s[0].toUpperCase()+s.slice(1) : ''; }

function updateCount() { const remaining = todos.filter(t=>!t.completed).length; countEl.textContent = `${remaining} item${remaining!==1?'s':''} left`; }

function addTodo({title, priority='medium', dueDate='', tags=[]}){
  const trimmed = (title||'').trim(); if (!trimmed) return;
  const t = { id: uid(), title: trimmed, completed:false, createdAt: new Date().toISOString(), priority, dueDate: dueDate||'', tags };
  todos.unshift(t); save(); render();
}

function removeTodo(id){ todos = todos.filter(t=>t.id!==id); save(); render(); }
function toggleComplete(id){ todos = todos.map(t=>t.id===id?{...t, completed: !t.completed}:t); save(); render(); }

function startEdit(id){ const t = todos.find(x=>x.id===id); if(!t) return;
  const el = document.querySelector(`.todo[data-id="${id}"]`);
  if(!el) return;
  const input = document.createElement('input'); input.type='text'; input.className='edit-input'; input.value = t.title; input.setAttribute('aria-label','Edit todo');
  const meta = el.querySelector('.todo-title'); meta.replaceWith(input);
  input.focus(); input.select();
  function finish(saveEdit){ if(saveEdit){ const v = input.value.trim(); if(v){ todos = todos.map(x=>x.id===id?{...x,title:v}:x); save(); } } render(); }
  input.addEventListener('blur',()=>finish(true)); input.addEventListener('keydown',(e)=>{ if(e.key==='Enter') finish(true); if(e.key==='Escape') finish(false); });
}

function clearCompleted(){ if(!confirm('Remove all completed tasks?')) return; todos = todos.filter(t=>!t.completed); save(); render(); }

function exportTodos(){ const data = JSON.stringify(todos, null, 2); const blob = new Blob([data], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='todos.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }

function importTodosFile(file){ const reader = new FileReader(); reader.onload = (e)=>{ try{ const parsed = JSON.parse(e.target.result); if(Array.isArray(parsed)){ const normalized = parsed.map(p=>({ id: p.id||uid(), title: p.title||'', completed: !!p.completed, createdAt: p.createdAt||new Date().toISOString(), priority: p.priority||'medium', dueDate: p.dueDate||'', tags: Array.isArray(p.tags)?p.tags: (p.tags?String(p.tags).split(',').map(x=>x.trim()).filter(Boolean):[]) } )).filter(p=>p.title);
      todos = [...normalized, ...todos]; save(); render(); alert('Import successful: ' + normalized.length + ' tasks added.'); } else { throw new Error('Invalid format'); } } catch(err){ alert('Failed to import: '+err.message); } }; reader.readAsText(file); }

// bindings
addForm.addEventListener('submit',(e)=>{ e.preventDefault(); const tags = (tagsInput.value||'').split(',').map(x=>x.trim()).filter(Boolean); addTodo({ title:newTodo.value, priority:priorityInput.value, dueDate: dueDateInput.value, tags }); newTodo.value=''; tagsInput.value=''; dueDateInput.value=''; newTodo.focus(); });

filters.forEach(btn=>{ btn.addEventListener('click', ()=>{ filters.forEach(b=>b.setAttribute('aria-pressed','false')); btn.setAttribute('aria-pressed','true'); activeFilter = btn.getAttribute('data-filter'); render(); }); });

clearCompletedBtn.addEventListener('click', clearCompleted);
exportBtn.addEventListener('click', exportTodos);
importBtn.addEventListener('click', ()=> importFile.click());
importFile.addEventListener('change', (e)=>{ const f = e.target.files[0]; if(f) importTodosFile(f); importFile.value=''; });

sortSelect.addEventListener('change', render);
tagFilter.addEventListener('input', render);

// init
document.addEventListener('DOMContentLoaded', ()=>{ load(); render(); window.todoApp = { getTodos: ()=> todos, clearAll: ()=>{ todos=[]; save(); render(); } }; });
