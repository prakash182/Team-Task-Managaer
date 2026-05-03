import React, { useState } from 'react';
import { Calendar, User, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import './TaskCard.css';

const priorityColors = { low: 'var(--green)', medium: 'var(--yellow)', high: 'var(--red)' };
const statusOptions = ['todo', 'in-progress', 'review', 'done'];
const statusLabels = { 'todo': 'To Do', 'in-progress': 'In Progress', 'review': 'Review', 'done': 'Done' };

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, currentUserId, isAdmin }) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const isAssigned = task.assignedTo?._id === currentUserId;
  const isCreator = task.createdBy?._id === currentUserId;
  const canEdit = isAdmin || isAssigned || isCreator;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  const formatDate = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`task-card ${isOverdue ? 'overdue' : ''}`}>
      <div className="task-priority-bar" style={{ background: priorityColors[task.priority] }} />

      <div className="task-body">
        <div className="task-title">{task.title}</div>
        {task.description && <p className="task-desc">{task.description}</p>}

        <div className="task-meta">
          {task.dueDate && (
            <span className={`task-date ${isOverdue ? 'overdue-text' : ''}`}>
              <Calendar size={11} />
              {formatDate(task.dueDate)}
            </span>
          )}
          {task.assignedTo && (
            <span className="task-assignee">
              <User size={11} />
              {task.assignedTo.name}
            </span>
          )}
        </div>

        <div className="task-footer">
          {/* Status dropdown */}
          <div className="status-dropdown-wrap">
            <button className={`badge badge-${task.status} status-btn`}
              onClick={() => setShowStatusMenu(!showStatusMenu)}>
              {statusLabels[task.status]} <ChevronDown size={11} />
            </button>
            {showStatusMenu && (
              <div className="status-menu">
                {statusOptions.filter(s => s !== task.status).map(s => (
                  <button key={s} className={`status-option badge-${s}`}
                    onClick={() => { onStatusChange(task._id, s); setShowStatusMenu(false); }}>
                    {statusLabels[s]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {canEdit && (
            <div className="task-actions">
              <button className="icon-btn" onClick={onEdit} title="Edit">
                <Pencil size={13} />
              </button>
              {(isAdmin || isCreator) && (
                <button className="icon-btn danger" onClick={onDelete} title="Delete">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;