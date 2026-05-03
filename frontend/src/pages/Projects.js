import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, FolderOpen, Users, CheckCircle, Trash2, X } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Projects.css';

const PROJECT_COLORS = ['#5b7fff', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#38bdf8', '#fb923c'];

const CreateProjectModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', description: '', color: '#5b7fff' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/projects', form);
      toast.success('Project created!');
      onCreated(res.data.project);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">New Project</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Website Redesign" required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea rows={3} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="What's this project about?" />
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-picker">
              {PROJECT_COLORS.map(c => (
                <button key={c} type="button"
                  className={`color-dot ${form.color === c ? 'selected' : ''}`}
                  style={{ background: c }} onClick={() => setForm({ ...form, color: c })} />
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api.get('/projects')
      .then(res => setProjects(res.data.projects))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting project');
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div className="projects-page">
      <div className="page-header">
        <div>
          <h2>Projects</h2>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} you're part of</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={48} />
          <h3>No projects yet</h3>
          <p>Create your first project to start organizing tasks.</p>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => {
            const myRole = project.members.find(m => m.user._id === user._id)?.role;
            const isOwner = project.owner._id === user._id;
            return (
              <Link key={project._id} to={`/projects/${project._id}`} className="project-card card">
                <div className="project-card-top">
                  <div className="project-color-bar" style={{ background: project.color }} />
                  <div className="project-meta">
                    <span className={`badge badge-${project.status}`}>{project.status}</span>
                    {isOwner && (
                      <button className="icon-btn danger" onClick={e => handleDelete(e, project._id)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="project-name">{project.name}</h3>
                {project.description && (
                  <p className="project-desc">{project.description}</p>
                )}
                <div className="project-footer">
                  <div className="project-members">
                    <Users size={13} />
                    <span>{project.members.length} member{project.members.length !== 1 ? 's' : ''}</span>
                  </div>
                  <span className={`badge badge-${myRole}`}>{myRole}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={p => setProjects([p, ...projects])}
        />
      )}
    </div>
  );
};

export default Projects;