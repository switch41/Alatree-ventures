import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const UserForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams(); // For future edit functionality
  const isEdit = !!id; // For future edit functionality
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'user',
      isActive: true
    }
  });

  // In a full implementation, you'd fetch user data here for editing
  // useEffect(() => {
  //   if (isEdit) {
  //     fetchUserData();
  //   }
  // }, [id, isEdit]);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      let response;
      if (isEdit) {
        // This part would be for updating an existing user
        // response = await axios.put(`/api/admin/users/${id}`, data);
        toast.error('User editing is not yet implemented.');
        setSubmitting(false);
        return;
      } else {
        // Creating a new user
        response = await axios.post('/api/admin/users', data);
      }

      if (response.data.success) {
        toast.success(isEdit ? 'User updated successfully' : 'User created successfully');
        navigate('/users');
      }
    } catch (error) {
      console.error('Failed to save user:', error);
      const message = error.response?.data?.message || 'Failed to save user';
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
            onClick={() => navigate('/users')}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Users</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? t('users.editUser') : t('users.createUser')}
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">User Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('users.userName')} *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className={`input-field ${errors.name ? 'input-error' : ''}`}
                    placeholder="Enter user's full name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('users.userEmail')} *
                  </label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^\\w+([.-]?\\w+)*@\\w+([.-]?\\w+)*(\\.\\w{2,3})+$/,
                        message: 'Invalid email address'
                      }
                    })}
                    className={`input-field ${errors.email ? 'input-error' : ''}`}
                    placeholder="user@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {!isEdit && ( // Password field only for new user creation
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('users.userPassword')} *
                    </label>
                    <input
                      type="password"
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                      })}
                      className={`input-field ${errors.password ? 'input-error' : ''}`}
                      placeholder="Enter password"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('users.role')} *
                    </label>
                    <select
                      {...register('role', { required: 'Role is required' })}
                      className={`input-field ${errors.role ? 'input-error' : ''}`}
                    >
                      <option value="user">{t('users.user')}</option>
                      <option value="staff">{t('users.staff')}</option>
                      <option value="admin">{t('users.admin')}</option>
                    </select>
                    {errors.role && (
                      <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('common.status')}
                    </label>
                    <div className="flex items-center h-full">
                      <input
                        type="checkbox"
                        id="isActive"
                        {...register('isActive')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                        {t('users.active')}
                      </label>
                    </div>
                  </div>
                </div>
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
                      {isEdit ? 'Update User' : 'Create User'}
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/users')}
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

export default UserForm;
    