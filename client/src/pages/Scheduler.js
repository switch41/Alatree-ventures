import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Calendar,
  Settings,
  Loader2 // Added for specific button loading state
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Scheduler = () => {
  const { t } = useTranslation();
  const [schedulerStatus, setSchedulerStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [togglingJob, setTogglingJob] = useState(null); // State to track which job is currently being toggled

  useEffect(() => {
    fetchSchedulerStatus();
  }, []);

  const fetchSchedulerStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/scheduler');
      if (response.data.success) {
        setSchedulerStatus(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch scheduler status.');
      }
    } catch (error) {
      console.error('Failed to fetch scheduler status:', error);
      toast.error('Error fetching scheduler status. Please check server connection and logs.');
    } finally {
      setLoading(false);
    }
  };

  const toggleJob = async (jobKey, currentEnabledStatus) => {
    setTogglingJob(jobKey); // Set the job key to indicate it's being toggled

    // Optimistic UI update: immediately change the local state
    setSchedulerStatus(prevStatus => ({
      ...prevStatus,
      [jobKey]: {
        ...prevStatus[jobKey],
        enabled: !currentEnabledStatus,
      }
    }));

    try {
      const response = await axios.put(`/api/admin/scheduler/${jobKey}`, {
        enabled: !currentEnabledStatus
      });

      if (response.data.success) {
        toast.success(response.data.message);
        // Re-fetch to ensure consistency, especially for 'nextRun' which is calculated server-side
        fetchSchedulerStatus();
      } else {
        // Revert optimistic update if API call failed
        setSchedulerStatus(prevStatus => ({
          ...prevStatus,
          [jobKey]: {
            ...prevStatus[jobKey],
            enabled: currentEnabledStatus, // Revert to original status
          }
        }));
        toast.error(response.data.message || 'Failed to toggle job.');
      }
    } catch (error) {
      console.error('Failed to toggle job:', error);
      // Revert optimistic update on network or server error
      setSchedulerStatus(prevStatus => ({
        ...prevStatus,
        [jobKey]: {
          ...prevStatus[jobKey],
          enabled: currentEnabledStatus, // Revert to original status
        }
      }));
      toast.error('Error toggling job. Please check server connection and logs.');
    } finally {
      setTogglingJob(null); // Clear the toggling state
    }
  };

  // Helper function to get icon based on job name
  const getJobIcon = (jobName) => {
    switch (jobName) {
      case 'draw':
        return <Calendar className="w-5 h-5" />;
      case 'notifications':
        return <AlertCircle className="w-5 h-5" />;
      case 'cleanup':
        return <Settings className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  // Helper function to get status badge based on enabled status
  const getStatusBadge = (enabled) => {
    return (
      <span className={`badge ${enabled ? 'badge-success' : 'badge-danger'} flex items-center space-x-1`}>
        {enabled ? <CheckCircle className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
        <span>{enabled ? t('scheduler.enabled') : t('scheduler.disabled')}</span>
      </span>
    );
  };

  // Show a full-page spinner if initial data is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Render the main scheduler content
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('scheduler.title')}</h1>
        <div className="text-sm text-gray-500">
          {Object.values(schedulerStatus).filter(job => job.enabled).length} of{' '}
          {Object.keys(schedulerStatus).length} jobs enabled
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-5">
              <h3 className="text-lg font-medium text-gray-900">Total Jobs</h3>
              <p className="text-2xl font-semibold text-blue-600">
                {Object.keys(schedulerStatus).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-md bg-green-500 flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-5">
              <h3 className="text-lg font-medium text-gray-900">Active Jobs</h3>
              <p className="text-2xl font-semibold text-green-600">
                {Object.values(schedulerStatus).filter(job => job.enabled).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-md bg-orange-500 flex items-center justify-center">
                <Pause className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-5">
              <h3 className="text-lg font-medium text-gray-900">Inactive Jobs</h3>
              <p className="text-2xl font-semibold text-orange-600">
                {Object.values(schedulerStatus).filter(job => !job.enabled).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="card p-0">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Scheduled Jobs</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {Object.entries(schedulerStatus).map(([jobKey, job]) => (
            <div key={jobKey} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-md ${
                    job.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {getJobIcon(jobKey)}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{job.name}</h3>
                    <p className="text-sm text-gray-500">{job.description}</p>

                    <div className="mt-2 space-y-1">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          <strong>Schedule:</strong> {job.schedule}
                        </span>
                        {job.lastRun && (
                          <span>
                            <strong>Last Run:</strong> {new Date(job.lastRun).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {job.nextRun && (
                        <div className="text-sm text-gray-600">
                          <strong>Next Run:</strong> {new Date(job.nextRun).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {getStatusBadge(job.enabled)}

                  <button
                    onClick={() => toggleJob(jobKey, job.enabled)}
                    disabled={togglingJob === jobKey} 
                    className={`btn-${job.enabled ? 'secondary' : 'primary'} flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {togglingJob === jobKey ? (
                      <Loader2 className="w-4 h-4 animate-spin" /> // Show spinner when toggling
                    ) : job.enabled ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Disable</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Enable</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Job Types</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">{t('scheduler.prizeDraw')}</h3>
                <p className="text-sm text-gray-500">
                  Automatically runs prize draws at scheduled times and selects winners.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">{t('scheduler.notifications')}</h3>
                <p className="text-sm text-gray-500">
                  Sends scheduled notifications and reminders to users about tasks and events.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Settings className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">{t('scheduler.dataCleanup')}</h3>
                <p className="text-sm text-gray-500">
                  Performs maintenance tasks like cleaning old logs and expired data.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Scheduler Service</span>
              </div>
              <span className="badge badge-success">Running</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Job Queue</span>
              </div>
              <span className="badge badge-info">
                {Object.values(schedulerStatus).filter(job => job.enabled).length} active
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-600">
                <strong>Server Time:</strong> {new Date().toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <strong>Timezone:</strong> UTC
              </div>
            </div>
          </div>
        </div>
      </div>

      {Object.keys(schedulerStatus).length === 0 && !loading && (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <div className="text-gray-500">
            <div className="text-lg font-medium">No scheduled jobs configured</div>
            <p className="text-sm mt-1">Jobs will appear here once the scheduler service is running.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduler;
