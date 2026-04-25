import { useState } from 'react';
import type { Task } from '../types';
import { useApp } from '../context/AppContext';

interface Props { task: Task; onEdit: (task: Task) => void; }

export default function TaskCard({ task, onEdit }: Props) {
  const { updateTask, deleteTask } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const priorityClass = { low: 'priority-low', medium: 'priority-medium', high: 'priority-high' }[task.priority];
  const statusClass = { todo: 'status-todo', 'in-progress': 'status-progress', done: 'status-done' }[task.status];

  const cycleStatus = () => {
    const next = { todo: 'in-progress', 'in-progress': 'done', done: 'todo' } as const;
    updateTask(task.id, { status: next[task.status] });
  };

  return (
    <div className="task-card" data-testid={`task-card-${task.id}`} data-priority={task.priority} data-status={task.status}>
      <div className="task-card-header">
        <span className={`priority-badge ${priorityClass}`} data-testid={`priority-badge-${task.id}`}>{task.priority}</span>
        <div className="task-card-actions">
          <button className="icon-btn" data-testid={`edit-task-${task.id}`} onClick={() => onEdit(task)}>✎</button>
          <button className="icon-btn icon-btn-danger" data-testid={`delete-task-${task.id}`} onClick={() => setConfirmDelete(true)}>✕</button>
        </div>
      </div>
      <h3 className="task-title" data-testid={`task-title-${task.id}`}>{task.title}</h3>
      {task.description && <p className="task-desc">{task.description}</p>}
      <div className="task-meta">
        <span className="assignee-chip" data-testid={`assignee-${task.id}`}>
          <span className="avatar">{task.assignee[0]}</span>{task.assignee}
        </span>
        <span className="due-date">Due {task.dueDate}</span>
      </div>
      <button className={`status-btn ${statusClass}`} data-testid={`status-btn-${task.id}`} onClick={cycleStatus}>
        {task.status === 'todo' && '○ To Do'}
        {task.status === 'in-progress' && '◑ In Progress'}
        {task.status === 'done' && '● Done'}
      </button>
      {confirmDelete && (
        <div className="delete-confirm" data-testid="delete-confirm">
          <span>Delete this task?</span>
          <div className="delete-actions">
            <button className="btn-ghost btn-sm" data-testid="cancel-delete" onClick={() => setConfirmDelete(false)}>Cancel</button>
            <button className="btn-danger btn-sm" data-testid="confirm-delete" onClick={() => deleteTask(task.id)}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}