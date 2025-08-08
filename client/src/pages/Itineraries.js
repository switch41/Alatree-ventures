import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar,
  Users,
  Clock
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Itineraries = () => {
  const { t } = useTranslation();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchItineraries();
  }, [searchTerm, filters, pagination.current]);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      const response = await axios.get(`/api/admin/itineraries?${params}`);
      if (response.data.success) {
        setItineraries(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch itineraries:', error);
      toast.error('Failed to fetch itineraries');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itineraryId) => {
    if (window.confirm('Are you sure you want to delete this itinerary?')) {
      try {
        const response = await axios.delete(`/api/admin/itineraries/${itineraryId}`);
        if (response.data.success) {
          toast.success('Itinerary deleted successfully');
          fetchItineraries();
        }
      } catch (error) {
        console.error('Failed to delete itinerary:', error);
        toast.error('Failed to delete itinerary');
      }
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      draft: 'badge-warning',
      active: 'badge-success',
      paused: 'badge-warning',
      completed: 'badge-info'
    };
    return (
      <span className={`badge ${colors[status] || 'badge-info'}`}>
        {t(`itineraries.${status}`) || status}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const colors = {
      daily: 'badge-info',
      weekly: 'badge-success',
      monthly: 'badge-warning',
      campaign: 'badge-danger',
      event: 'badge-info'
    };
    return (
      <span className={`badge ${colors[type] || 'badge-info'}`}>
        {t(`itineraries.${type}`) || type}
      </span>
    );
  };

  if (loading && itineraries.length === 0) {
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
        <h1 className="text-2xl font-bold text-gray-900">{t('itineraries.title')}</h1>
        <Link
          to="/itineraries/new"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('itineraries.createItinerary')}</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <option value="daily">{t('itineraries.daily')}</option>
            <option value="weekly">{t('itineraries.weekly')}</option>
            <option value="monthly">{t('itineraries.monthly')}</option>
            <option value="campaign">{t('itineraries.campaign')}</option>
            <option value="event">Event</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field"
          >
            <option value="">{t('common.status')}</option>
            <option value="draft">{t('itineraries.draft')}</option>
            <option value="active">Active</option>
            <option value="paused">{t('itineraries.paused')}</option>
            <option value="completed">{t('itineraries.completed')}</option>
          </select>
        </div>
      </div>

      {/* Itineraries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itineraries.map((itinerary) => (
          <div key={itinerary._id} className="card hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {itinerary.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {itinerary.description}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Link
                  to={`/itineraries/${itinerary._id}/edit`}
                  className="text-blue-600 hover:text-blue-800 focus-ring p-1 rounded"
                  title={t('common.edit')}
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(itinerary._id)}
                  className="text-red-600 hover:text-red-800 focus-ring p-1 rounded"
                  title={t('common.delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-4">
              {getTypeBadge(itinerary.type)}
              {getStatusBadge(itinerary.status)}
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  {new Date(itinerary.schedule.startDate).toLocaleDateString()} 
                  {itinerary.schedule.endDate && (
                    <> - {new Date(itinerary.schedule.endDate).toLocaleDateString()}</>
                  )}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>{itinerary.tasks?.length || 0} tasks</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                <span>{itinerary.metrics?.totalParticipants || 0} participants</span>
              </div>
            </div>

            {itinerary.metrics?.completionRate !== undefined && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium">
                    {Math.round(itinerary.metrics.completionRate)}%
                  </span>
                </div>
                <div className="mt-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${itinerary.metrics.completionRate}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
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
      )}

      {itineraries.length === 0 && !loading && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <div className="text-gray-500">
            <div className="text-lg font-medium">No itineraries found</div>
            <p className="text-sm mt-1">Get started by creating your first itinerary.</p>
            <Link
              to="/itineraries/new"
              className="btn-primary mt-4 inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('itineraries.createItinerary')}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Itineraries;
