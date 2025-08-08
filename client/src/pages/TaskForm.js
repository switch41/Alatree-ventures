import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const TaskForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      type: 'survey',
      category: '',
      points: 0,
      duration: 30,
      difficulty: 'medium',
      requirements: [],
      startDate: '',
      endDate: '',
      isActive: true
    }
  });

  useEffect(() => {
    if (isEdit) {
      fetchTask();
    }
  }, [id, isEdit]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/tasks/${id}`);
      if (response.data.success) {
        const task = response.data.data;
        reset({
          ...task,
          startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
          endDate: task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : '',
          requirements: task.requirements || []
        });
      }
    } catch (error) {
      console.error('Failed to fetch task:', error);
      toast.error('Failed to fetch task');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      const payload = {
        ...data,
        points: parseInt(data.points),
        duration: parseInt(data.duration),
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined
      };

      let response;
      if (isEdit) {
        response = await axios.put(`/api/admin/tasks/${id}`, payload);
      } else {
        response = await axios.post('/api/admin/tasks', payload);
      }

      if (response.data.success) {
        toast.success(isEdit ? 'Task updated successfully' : 'Task created successfully');
        navigate('/tasks');
      }
    } catch (error) {
      console.error('Failed to save task:', error);
      const message = error.response?.data?.message || 'Failed to save task';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/tasks')}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tasks</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? t('tasks.editTask') : t('tasks.createTask')}
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tasks.taskTitle')} *
                  </label>
                  <input
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    className={`input-field ${errors.title ? 'input-error' : ''}`}
                    placeholder="Enter task title"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tasks.taskDescription')} *
                  </label>
                  <textarea
                    rows={4}
                    {...register('description', { required: 'Description is required' })}
                    className={`input-field ${errors.description ? 'input-error' : ''}`}
                    placeholder="Enter task description"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tasks.taskType')} *
                    </label>
                    <select
                      {...register('type', { required: 'Type is required' })}
                      className={`input-field ${errors.type ? 'input-error' : ''}`}
                    >
                      <option value="survey">{t('tasks.survey')}</option>
                      <option value="quiz">{t('tasks.quiz')}</option>
                      <option value="challenge">{t('tasks.challenge')}</option>
                      <option value="event">{t('tasks.event')}</option>
                      <option value="submission">{t('tasks.submission')}</option>
                    </select>
                    {errors.type && (
                      <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('common.category')} *
                    </label>
                    <input
                      type="text"
                      {...register('category', { required: 'Category is required' })}
                      className={`input-field ${errors.category ? 'input-error' : ''}`}
                      placeholder="e.g. Education, Entertainment"
                    />
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tasks.points')} *
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register('points', { 
                        required: 'Points is required',
                        min: { value: 0, message: 'Points cannot be negative' }
                      })}
                      className={`input-field ${errors.points ? 'input-error' : ''}`}
                      placeholder="100"
                    />
                    {errors.points && (
                      <p className="text-red-500 text-sm mt-1">{errors.points.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tasks.duration')} (minutes) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      {...register('duration', { 
                        required: 'Duration is required',
                        min: { value: 1, message: 'Duration must be at least 1 minute' }
                      })}
                      className={`input-field ${errors.duration ? 'input-error' : ''}`}
                      placeholder="30"
                    />
                    {errors.duration && (
                      <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tasks.difficulty')}
                    </label>
                    <select {...register('difficulty')} className="input-field">
                      <option value="easy">{t('tasks.easy')}</option>
                      <option value="medium">{t('tasks.medium')}</option>
                      <option value="hard">{t('tasks.hard')}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Schedule</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tasks.startDate')}
                  </label>
                  <input
                    type="date"
                    {...register('startDate')}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tasks.endDate')}
                  </label>
                  <input
                    type="date"
                    {...register('endDate')}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    {t('tasks.active')}
                  </label>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
              
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Save className="w-4 h-4 mr-2" />
                      {isEdit ? 'Update Task' : 'Create Task'}
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/tasks')}
                  className="w-full btn-secondary"
                >
                  <div className="flex items-center justify-center">
                    <X className="w-4 h-4 mr-2" />
                    {t('common.cancel')}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
