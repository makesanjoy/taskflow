import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModel';
import type { Task, Priority, Status } from '../types';

export default function TasksPage() {
  const { tasks, addTask, updateTask } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'priority'>('createdAt');

  const filtered = useMemo(() => {
    const pw = { high: 3, medium: 2, low: 1 };
    return tasks
      .filter(t => {
        if (filterStatus !== 'all' && t.status !== filterStatus) return false;
        if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
        if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => sortBy === 'priority' ? pw[b.priority] - pw[a.priority] : b[sortBy].localeCompare(a[sortBy]));
  }, [tasks, filterStatus, filterPriority, search, sortBy]);

  const handleSave = (data: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) updateTask(editingTask.id, data);
    else addTask(data);
    setShowModal(false);
    setEditingTask(null);
  };

  return (
    <div className="page" data-testid="tasks-page">
      <div className="page-header">
        <div>
          <h1>Tasks</h1>
          <p className="page-sub">{filtered.length} of {tasks.length} tasks</p>
        </div>
        <button className="btn-primary" data-testid="new-task-button" onClick={() => { setEditingTask(null); setShowModal(true); }}>+ New task</button>
      </div>
      <div className="filters-bar" data-testid="filters-bar">
        <input type="search" className="search-input" data-testid="search-input" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-select" data-testid="status-filter" value={filterStatus} onChange={e => setFilterStatus(e.target.value as Status | 'all')}>
          <option value="all">All statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select className="filter-select" data-testid="priority-filter" value={filterPriority} onChange={e => setFilterPriority(e.target.value as Priority | 'all')}>
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="filter-select" data-testid="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}>
          <option value="createdAt">Sort: Newest</option>
          <option value="dueDate">Sort: Due date</option>
          <option value="priority">Sort: Priority</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state" data-testid="empty-state">
          <div className="empty-icon">📋</div>
          <p>No tasks found.</p>
        </div>
      ) : (
        <div className="tasks-grid" data-testid="tasks-grid">
          {filtered.map(task => (
            <TaskCard key={task.id} task={task} onEdit={t => { setEditingTask(t); setShowModal(true); }} />
          ))}
        </div>
      )}
      {showModal && <TaskModal task={editingTask} onSave={handleSave} onClose={() => { setShowModal(false); setEditingTask(null); }} />}
    </div>
  );
}