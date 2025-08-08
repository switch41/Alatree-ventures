import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const ItineraryForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      type: 'daily',
      status: 'draft',
      schedule: {
        startDate: '',
        endDate: '',
        recurrence: 'none'
      }
    }
  });

  useEffect(() => {
    fetchAvailableTasks();
    if (isEdit) {
      fetchItinerary();
    }
  }, [id, isEdit]);

  const fetchAvailableTasks = async () => {
    try {
      const response = await axios.get('/api/admin/tasks?limit=100');
      if (response.data.success) {
        setAvailableTasks(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const fetchItinerary = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/itineraries/${id}`);
      if (response.data.success) {
        const itinerary = response.data.data;
        reset({
          ...itinerary,
          schedule: {
            ...itinerary.schedule,
            startDate: itinerary.schedule.startDate ? 
              new Date(itinerary.schedule.startDate).toISOString().split('T')[0] : '',
            endDate: itinerary.schedule.endDate ? 
              new Date(itinerary.schedule.endDate).toISOString().split('T')[0] : ''
          }
        });
        setSelectedTasks(itinerary.tasks || []);
      }
    } catch (error) {
      console.error('Failed to fetch itinerary:', error);
      toast.error('Failed to fetch itinerary');
      navigate('/itineraries');
    } finally {
      setLoading(false);
    }
  };

  const addTask = (taskId) => {
    const task = availableTasks.find(t => t._id === taskId);
    if (task && !selectedTasks.find(st => st.task._id === taskId)) {
      setSelectedTasks([...selectedTasks, {
        task: task,
        order: selectedTasks.length + 1,
        isOptional: false
      }]);
    }
  };

  const removeTask = (index) => {
    const updatedTasks = selectedTasks.filter((_, i) => i !== index);
    // Re-order remaining tasks
    const reorderedTasks = updatedTasks.map((task, i) => ({
      ...task,
      order: i + 1
    }));
    setSelectedTasks(reorderedTasks);
  };

  const moveTask = (index, direction) => {
    const newTasks = [...selectedTasks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newTasks.length) {
      [newTasks[index], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[index]];
      // Update order numbers
      newTasks.forEach((task, i) => {
        task.order = i + 1;
      });
      setSelectedTasks(newTasks);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      const payload = {
        ...data,
        schedule: {
          ...data.schedule,
          startDate: data.schedule.startDate ? new Date(data.schedule.startDate) : undefined,
          endDate: data.schedule.endDate ? new Date(data.schedule.endDate) : undefined
        },
        tasks: selectedTasks.map(st => ({
          task: st.task._id,
          order: st.order,
          isOptional: st.isOptional || false
        }))
      };

      let response;
      if (isEdit) {
        response = await axios.put(`/api/admin/itineraries/${id}`, payload);
      } else {
        response = await axios.post('/api/admin/itineraries', payload);
      }

      if (response.data.success) {
        toast.success(isEdit ? 'Itinerary updated successfully' : 'Itinerary created successfully');
        navigate('/itineraries');
      }
    } catch (error) {
      console.error('Failed to save itinerary:', error);
      const message = error.response?.data?.message || 'Failed to save itinerary';
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
            onClick={() => navigate('/itineraries')}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Itineraries</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? t('itineraries.editItinerary') : t('itineraries.createItinerary')}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('common.name')} *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className={`input-field ${errors.name ? 'input-error' : ''}`}
                    placeholder="Enter itinerary name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('common.description')} *
                  </label>
                  <textarea
                    rows={3}
                    {...register('description', { required: 'Description is required' })}
                    className={`input-field ${errors.description ? 'input-error' : ''}`}
                    placeholder="Enter itinerary description"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('common.type')} *
                    </label>
                    <select
                      {...register('type', { required: 'Type is required' })}
                      className={`input-field ${errors.type ? 'input-error' : ''}`}
                    >
                      <option value="daily">{t('itineraries.daily')}</option>
                      <option value="weekly">{t('itineraries.weekly')}</option>
                      <option value="monthly">{t('itineraries.monthly')}</option>
                      <option value="campaign">{t('itineraries.campaign')}</option>
                      <option value="event">Event</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('common.status')}
                    </label>
                    <select {...register('status')} className="input-field">
                      <option value="draft">{t('itineraries.draft')}</option>
                      <option value="active">Active</option>
                      <option value="paused">{t('itineraries.paused')}</option>
                      <option value="completed">{t('itineraries.completed')}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('itineraries.schedule')}</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      {...register('schedule.startDate', { required: 'Start date is required' })}
                      className={`input-field ${errors.schedule?.startDate ? 'input-error' : ''}`}
                    />
                    {errors.schedule?.startDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.schedule.startDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      {...register('schedule.endDate')}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recurrence
                  </label>
                  <select {...register('schedule.recurrence')} className="input-field">
                    <option value="none">No recurrence</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Tasks</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Task
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addTask(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="input-field"
                  >
                    <option value="">Select a task to add</option>
                    {availableTasks
                      .filter(task => !selectedTasks.find(st => st.task._id === task._id))
                      .map(task => (
                        <option key={task._id} value={task._id}>
                          {task.title} ({task.type})
                        </option>
                      ))}
                  </select>
                </div>

                {selectedTasks.length > 0 && (
                  <div className="border border-gray-200 rounded-md">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <h3 className="font-medium text-gray-900">Selected Tasks ({selectedTasks.length})</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {selectedTasks.map((selectedTask, index) => (
                        <div key={index} className="p-4 flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                                {selectedTask.order}
                              </span>
                              <div>
                                <p className="font-medium text-gray-900">{selectedTask.task.title}</p>
                                <p className="text-sm text-gray-500">{selectedTask.task.type} • {selectedTask.task.points} points</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => moveTask(index, 'up')}
                              disabled={index === 0}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-1"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveTask(index, 'down')}
                              disabled={index === selectedTasks.length - 1}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-1"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => removeTask(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                      {isEdit ? 'Update Itinerary' : 'Create Itinerary'}
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/itineraries')}
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

export default ItineraryForm;
