import React, { useState, useEffect } from 'react';
import type { Task, Priority, Status } from '../types';

interface Props {
  task?: Task | null;
  onSave: (data: Omit<Task, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const ASSIGNEES = ['Alice', 'Bob', 'Charlie', 'Diana'];

export default function TaskModal({ task, onSave, onClose }: Props) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium');
  const [status, setStatus] = useState<Status>(task?.status ?? 'todo');
  const [assignee, setAssignee] = useState(task?.assignee ?? 'Alice');
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!dueDate) errs.dueDate = 'Due date is required';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ title: title.trim(), description, priority, status, assignee, dueDate });
  };

  return (
    <div className="modal-overlay" data-testid="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" data-testid="task-modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>{task ? 'Edit task' : 'New task'}</h2>
          <button className="modal-close" data-testid="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} data-testid="task-form" noValidate>
          <div className="field">
            <label htmlFor="task-title">Title *</label>
            <input id="task-title" data-testid="task-title-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs to be done?" />
            {errors.title && <span className="field-error" data-testid="title-error">{errors.title}</span>}
          </div>
          <div className="field">
            <label htmlFor="task-desc">Description</label>
            <textarea id="task-desc" data-testid="task-description-input" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Add more details..." />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="task-priority">Priority</label>
              <select id="task-priority" data-testid="task-priority-select" value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="task-status">Status</label>
              <select id="task-status" data-testid="task-status-select" value={status} onChange={e => setStatus(e.target.value as Status)}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="task-assignee">Assignee</label>
              <select id="task-assignee" data-testid="task-assignee-select" value={assignee} onChange={e => setAssignee(e.target.value)}>
                {ASSIGNEES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="task-due">Due date *</label>
              <input id="task-due" type="date" data-testid="task-duedate-input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              {errors.dueDate && <span className="field-error" data-testid="duedate-error">{errors.dueDate}</span>}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" data-testid="cancel-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" data-testid="save-task-button">{task ? 'Update task' : 'Create task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}