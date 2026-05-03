import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, AlertTriangle, FolderOpen, ListTodo } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const statusConfig = {
  todo: { label: 'To Do', color: 'var(--text-muted)', bg: 'var(--bg-hover)' },
  'in-progress': { label: 'In Progress', color: 'var(--yellow)', bg: 'var(--yellow-dim)' },
  review: { label: 'In Review', color: 'var(--purple)', bg: 'var(--purple-dim)' },
  done: { label: 'Done', color: 'var(--green)', bg: 'var(--green-dim)' }
};

const priorityConfig = {
  low: { label: 'Low', color: 'var(--green)' },
  medium: { label: 'Medium', color: 'var(--yellow)' },
  high: { label: 'High', color: 'var(--red)' }
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard')
      .then(res => setStats(res.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-loading">
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  const cards = [
    { label: 'Total Projects', value: stats?.totalProjects || 0, icon: FolderOpen, color: 'var(--accent)' },
    { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: ListTodo, color: 'var(--purple)' },
    { label: 'My Tasks', value: stats?.myTasks || 0, icon: Clock, color: 'var(--yellow)' },
    { label: 'Overdue', value: stats?.overdue || 0, icon: AlertTriangle, color: 'var(--red)' },
  ];

  const completionPct = stats?.totalTasks
    ? Math.round((stats.byStatus?.done / stats.totalTasks) * 100)
    : 0;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h2>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
          <p className="page-subtitle">Here's an overview of all your work.</p>
        </div>
        <Link to="/projects" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <FolderOpen size={16} /> View Projects
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card card">
            <div className="stat-icon" style={{ background: `${color}18`, color }}>
              <Icon size={20} />
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Task Status Breakdown */}
        <div className="card status-breakdown">
          <h3 className="card-title">Task Status</h3>
          <div className="status-list">
            {Object.entries(statusConfig).map(([key, { label, color, bg }]) => {
              const count = stats?.byStatus?.[key] || 0;
              const pct = stats?.totalTasks ? Math.round((count / stats.totalTasks) * 100) : 0;
              return (
                <div key={key} className="status-row">
                  <div className="status-info">
                    <span className="badge" style={{ background: bg, color }}>{label}</span>
                    <span className="status-count">{count}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <span className="pct-label">{pct}%</span>
                </div>
              );
            })}
          </div>
          <div className="completion-summary">
            <CheckCircle2 size={16} style={{ color: 'var(--green)' }} />
            <span>{completionPct}% of all tasks completed</span>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card recent-tasks">
          <h3 className="card-title">Recent Tasks</h3>
          {stats?.recentTasks?.length > 0 ? (
            <div className="recent-list">
              {stats.recentTasks.map(task => (
                <div key={task._id} className="recent-item">
                  <div className="recent-task-info">
                    <div className="recent-task-title">{task.title}</div>
                    <div className="recent-task-meta">
                      <span style={{ color: priorityConfig[task.priority]?.color, fontSize: 12 }}>
                        {priorityConfig[task.priority]?.label}
                      </span>
                      {task.project && (
                        <span className="project-chip" style={{ borderColor: task.project.color }}>
                          {task.project.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`badge badge-${task.status}`}>
                    {statusConfig[task.status]?.label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <ListTodo size={32} />
              <p>No tasks yet. Create a project to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;