import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function DashboardPage() {
  const { tasks, user } = useApp();

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    high: tasks.filter(t => t.priority === 'high').length,
  };

  const recent = [...tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  return (
    <div className="page" data-testid="dashboard-page">
      <div className="page-header">
        <div>
          <h1 data-testid="dashboard-heading">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-sub">Here's what's happening with your projects today.</p>
        </div>
        <Link to="/tasks" className="btn-primary" data-testid="go-to-tasks-btn">View all tasks →</Link>
      </div>
      <div className="stats-grid" data-testid="stats-grid">
        <div className="stat-card" data-testid="stat-total"><div className="stat-value">{stats.total}</div><div className="stat-label">Total tasks</div></div>
        <div className="stat-card stat-todo" data-testid="stat-todo"><div className="stat-value">{stats.todo}</div><div className="stat-label">To do</div></div>
        <div className="stat-card stat-progress" data-testid="stat-in-progress"><div className="stat-value">{stats.inProgress}</div><div className="stat-label">In progress</div></div>
        <div className="stat-card stat-done" data-testid="stat-done"><div className="stat-value">{stats.done}</div><div className="stat-label">Completed</div></div>
        <div className="stat-card stat-high" data-testid="stat-high-priority"><div className="stat-value">{stats.high}</div><div className="stat-label">High priority</div></div>
      </div>
      <div className="section">
        <h2 className="section-title">Recent tasks</h2>
        <div className="recent-list" data-testid="recent-tasks">
          {recent.map(task => (
            <div key={task.id} className="recent-item" data-testid={`recent-task-${task.id}`}>
              <div className="recent-left">
                <span className={`priority-dot priority-${task.priority}`} />
                <span className="recent-title">{task.title}</span>
              </div>
              <div className="recent-right">
                <span className={`status-chip status-chip-${task.status}`}>
                  {task.status === 'in-progress' ? 'In Progress' : task.status === 'todo' ? 'To Do' : 'Done'}
                </span>
                <span className="assignee-sm">{task.assignee}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}