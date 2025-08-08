import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Users, 
  CheckSquare, 
  Calendar, 
  Target,
  TrendingUp,
  Clock
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/admin/report');
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      name: t('dashboard.totalUsers'),
      value: analytics?.overview?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      link: '/users'
    },
    {
      name: t('dashboard.totalTasks'),
      value: analytics?.overview?.totalTasks || 0,
      icon: CheckSquare,
      color: 'bg-green-500',
      link: '/tasks'
    },
    {
      name: t('dashboard.totalItineraries'),
      value: analytics?.overview?.totalItineraries || 0,
      icon: Calendar,
      color: 'bg-purple-500',
      link: '/itineraries'
    },
    {
      name: t('dashboard.activeCycles'),
      value: analytics?.overview?.activeCycles || 0,
      icon: Target,
      color: 'bg-orange-500',
      link: '/analytics'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.link}
              className="card hover:shadow-md transition-shadow duration-200 focus-ring"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-md ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {t('dashboard.recentActivity')}
            </h2>
            <Link 
              to="/tasks" 
              className="text-sm text-blue-600 hover:text-blue-800 focus-ring rounded-md px-2 py-1"
            >
              View all
            </Link>
          </div>
          
          {analytics?.recentActivity?.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                  <div className="flex-shrink-0">
                    <CheckSquare className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.type} • by {activity.createdBy}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-xs text-gray-400">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No recent activity</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/tasks/new"
              className="flex items-center p-3 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors focus-ring"
            >
              <CheckSquare className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-blue-900">Create New Task</span>
            </Link>
            
            <Link
              to="/itineraries/new"
              className="flex items-center p-3 bg-green-50 rounded-md hover:bg-green-100 transition-colors focus-ring"
            >
              <Calendar className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-sm font-medium text-green-900">Create New Itinerary</span>
            </Link>
            
            <Link
              to="/analytics"
              className="flex items-center p-3 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors focus-ring"
            >
              <TrendingUp className="w-5 h-5 text-purple-600 mr-3" />
              <span className="text-sm font-medium text-purple-900">View Analytics</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;