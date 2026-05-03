import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Plus, UserPlus, Trash2, X } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import './ProjectDetail.css';

const COLUMNS = [
  { key: 'todo', label: 'To Do', badgeClass: 'badge-todo' },
  { key: 'in-progress', label: 'In Progress', badgeClass: 'badge-in-progress' },
  { key: 'review', label: 'Review', badgeClass: 'badge-review' },
  { key: 'done', label: 'Done', badgeClass: 'badge-done' },
];

const AddMemberModal = ({ projectId, onClose, onAdded }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post(`/projects/${projectId}/members`, { email, role });
      toast.success('Member added!');
      onAdded(res.data.project);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Team Member</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="teammate@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [defaultStatus, setDefaultStatus] = useState('todo');

  const myRole = project?.members?.find(m => m.user._id === user._id)?.role;
  const isAdmin = myRole === 'admin';

  const fetchData = useCallback(async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
      ]);
      setProject(projRes.data.project);
      setTasks(taskRes.data.tasks);
    } catch (err) {
      toast.error('Could not load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTaskSaved = (task, isNew) => {
    setTasks(prev =>
      isNew ? [task, ...prev] : prev.map(t => t._id === task._id ? task : t)
    );
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? res.data.task : t));
    } catch (err) {
      toast.error('Could not update status');
    }
  };

  const openCreateTask = (status = 'todo') => {
    setDefaultStatus(status);
    setShowCreateTask(true);
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${memberId}`);
      setProject(res.data.project);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  const tasksByStatus = {};
  COLUMNS.forEach(col => {
    tasksByStatus[col.key] = tasks.filter(t => t.status === col.key);
  });

  return (
    <div className="project-detail">
      {/* Header */}
      <div className="detail-header">
        <button className="btn-ghost back-btn" onClick={() => navigate('/projects')}>
          <ArrowLeft size={16} /> Projects
        </button>
        <div className="detail-title-row">
          <div className="project-dot" style={{ background: project.color }} />
          <h2>{project.name}</h2>
          <span className={`badge badge-${project.status}`}>{project.status}</span>
        </div>
        {project.description && <p className="detail-desc">{project.description}</p>}

        <div className="detail-actions">
          <div className="detail-tabs">
            <button className={activeTab === 'tasks' ? 'tab active' : 'tab'} onClick={() => setActiveTab('tasks')}>
              Tasks ({tasks.length})
            </button>
            <button className={activeTab === 'team' ? 'tab active' : 'tab'} onClick={() => setActiveTab('team')}>
              Team ({project.members.length})
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {isAdmin && (
              <button className="btn-ghost" onClick={() => setShowAddMember(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <UserPlus size={15} /> Add Member
              </button>
            )}
            <button className="btn-primary" onClick={() => openCreateTask()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={15} /> Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Tasks Board */}
      {activeTab === 'tasks' && (
        <div className="kanban-board">
          {COLUMNS.map(col => (
            <div key={col.key} className="kanban-col">
              <div className="kanban-col-header">
                <span className={`badge ${col.badgeClass}`}>{col.label}</span>
                <span className="col-count">{tasksByStatus[col.key].length}</span>
                <button className="col-add-btn" onClick={() => openCreateTask(col.key)} title="Add task">
                  <Plus size={14} />
                </button>
              </div>
              <div className="kanban-tasks">
                {tasksByStatus[col.key].map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={() => setEditTask(task)}
                    onDelete={() => handleDeleteTask(task._id)}
                    onStatusChange={handleStatusChange}
                    currentUserId={user._id}
                    isAdmin={isAdmin}
                  />
                ))}
                {tasksByStatus[col.key].length === 0 && (
                  <div className="col-empty">No tasks here</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team Tab */}
      {activeTab === 'team' && (
        <div className="team-list">
          {project.members.map(member => {
            const isOwner = member.user._id === project.owner._id;
            const isSelf = member.user._id === user._id;
            return (
              <div key={member.user._id} className="team-member card">
                <div className="member-avatar">
                  {member.user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="member-info">
                  <div className="member-name">{member.user.name} {isSelf && <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>(you)</span>}</div>
                  <div className="member-email">{member.user.email}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge badge-${member.role}`}>{member.role}</span>
                  {isOwner && <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>owner</span>}
                  {isAdmin && !isOwner && !isSelf && (
                    <button className="icon-btn danger" onClick={() => handleRemoveMember(member.user._id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showAddMember && (
        <AddMemberModal
          projectId={id}
          onClose={() => setShowAddMember(false)}
          onAdded={setProject}
        />
      )}

      {(showCreateTask || editTask) && (
        <TaskModal
          task={editTask}
          defaultStatus={defaultStatus}
          projectId={id}
          members={project.members}
          onClose={() => { setShowCreateTask(false); setEditTask(null); }}
          onSaved={handleTaskSaved}
        />
      )}
    </div>
  );
};

export default ProjectDetail;