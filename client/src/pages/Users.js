import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Filter, 
  Edit, 
  Shield,
  User,
  Crown,
  Plus // Added Plus icon for Create User
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom'; // Import Link

const Users = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [editingRole, setEditingRole] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, filters, pagination.current]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      const response = await axios.get(`/api/admin/users?${params}`);
      if (response.data.success) {
        setUsers(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await axios.put(`/api/admin/users/${userId}/role`, {
        role: newRole
      });

      if (response.data.success) {
        toast.success(t('users.roleUpdated'));
        setEditingRole(null);
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'staff':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'badge-danger',
      staff: 'badge-info',
      user: 'badge-success'
    };
    return (
      <span className={`badge ${colors[role] || 'badge-success'} flex items-center space-x-1`}>
        {getRoleIcon(role)}
        <span>{t(`users.${role}`)}</span>
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  if (loading && users.length === 0) {
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
        <h1 className="text-2xl font-bold text-gray-900">{t('users.title')}</h1>
        <Link
          to="/users/new"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('users.createUser')}</span>
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
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="input-field"
          >
            <option value="">{t('users.role')}</option>
            <option value="admin">{t('users.admin')}</option>
            <option value="staff">{t('users.staff')}</option>
            <option value="user">{t('users.user')}</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field"
          >
            <option value="">{t('common.status')}</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">{t('common.name')}</th>
                <th className="table-header">Email</th>
                <th className="table-header">{t('users.role')}</th>
                <th className="table-header">{t('common.status')}</th>
                <th className="table-header">{t('users.lastLogin')}</th>
                <th className="table-header">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">{user.email}</span>
                  </td>
                  <td className="table-cell">
                    {editingRole === user._id ? (
                      <div className="flex items-center space-x-2">
                        <select
                          defaultValue={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus-ring"
                        >
                          <option value="user">{t('users.user')}</option>
                          <option value="staff">{t('users.staff')}</option>
                          <option value="admin">{t('users.admin')}</option>
                        </select>
                        <button
                          onClick={() => setEditingRole(null)}
                          className="text-gray-400 hover:text-gray-600 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      getRoleBadge(user.role)
                    )}
                  </td>
                  <td className="table-cell">{getStatusBadge(user.isActive)}</td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">
                      {user.lastLogin 
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      {editingRole !== user._id && (
                        <button
                          onClick={() => setEditingRole(user._id)}
                          className="text-blue-600 hover:text-blue-800 focus-ring p-1 rounded"
                          title={t('users.changeRole')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
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

      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <div className="text-gray-500">
            <div className="text-lg font-medium">No users found</div>
            <p className="text-sm mt-1">Get started by creating your first user.</p>
            <Link
              to="/users/new"
              className="btn-primary mt-4 inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('users.createUser')}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
