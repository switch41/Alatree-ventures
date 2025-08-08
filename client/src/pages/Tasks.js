import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  MoreVertical
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Tasks = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchTasks();
  }, [searchTerm, filters, pagination.current]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      const response = await axios.get(`/api/admin/tasks?${params}`);
      if (response.data.success) {
        setTasks(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await axios.delete(`/api/admin/tasks/${taskId}`);
        if (response.data.success) {
          toast.success('Task deleted successfully');
          fetchTasks();
        }
      } catch (error) {
        console.error('Failed to delete task:', error);
        toast.error('Failed to delete task');
      }
    }
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`}>
        {isActive ? t('tasks.active') : t('tasks.inactive')}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const colors = {
      survey: 'badge-info',
      quiz: 'badge-warning',
      challenge: 'badge-success',
      event: 'badge-info',
      submission: 'badge-warning'
    };
    return (
      <span className={`badge ${colors[type] || 'badge-info'}`}>
        {t(`tasks.${type}`)}
      </span>
    );
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('tasks.title')}</h1>
        <Link
          to="/tasks/new"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('tasks.createTask')}</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="input-field"
          >
            <option value="">{t('common.type')}</option>
            <option value="survey">{t('tasks.survey')}</option>
            <option value="quiz">{t('tasks.quiz')}</option>
            <option value="challenge">{t('tasks.challenge')}</option>
            <option value="event">{t('tasks.event')}</option>
            <option value="submission">{t('tasks.submission')}</option>
          </select>

          <input
            type="text"
            placeholder={t('common.category')}
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="input-field"
          />

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field"
          >
            <option value="">{t('common.status')}</option>
            <option value="active">{t('tasks.active')}</option>
            <option value="inactive">{t('tasks.inactive')}</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">{t('tasks.taskTitle')}</th>
                <th className="table-header">{t('common.type')}</th>
                <th className="table-header">{t('common.category')}</th>
                <th className="table-header">{t('tasks.points')}</th>
                <th className="table-header">{t('tasks.duration')}</th>
                <th className="table-header">{t('common.status')}</th>
                <th className="table-header">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task) => (
                <tr key={task._id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div>
                      <div className="font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {task.description}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">{getTypeBadge(task.type)}</td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">{task.category}</span>
                  </td>
                  <td className="table-cell">
                    <span className="font-medium">{task.points}</span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">{task.duration}m</span>
                  </td>
                  <td className="table-cell">{getStatusBadge(task.isActive)}</td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/tasks/${task._id}/edit`}
                        className="text-blue-600 hover:text-blue-800 focus-ring p-1 rounded"
                        title={t('common.edit')}
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="text-red-600 hover:text-red-800 focus-ring p-1 rounded"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.current - 1) * 10) + 1} to{' '}
                {Math.min(pagination.current * 10, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
                  disabled={pagination.current === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {pagination.current} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
                  disabled={pagination.current === pagination.pages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {tasks.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <div className="text-lg font-medium">No tasks found</div>
            <p className="text-sm mt-1">Get started by creating your first task.</p>
            <Link
              to="/tasks/new"
              className="btn-primary mt-4 inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('tasks.createTask')}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
