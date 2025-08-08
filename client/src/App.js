import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import TaskForm from './pages/TaskForm';
import Itineraries from './pages/Itineraries';
import ItineraryForm from './pages/ItineraryForm';
import Users from './pages/Users';
import UserForm from './pages/UserForm'; // Import the new UserForm
import Analytics from './pages/Analytics';
import Scheduler from './pages/Scheduler';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/tasks/new" element={<TaskForm />} />
                      <Route path="/tasks/:id/edit" element={<TaskForm />} />
                      <Route path="/itineraries" element={<Itineraries />} />
                      <Route path="/itineraries/new" element={<ItineraryForm />} />
                      <Route path="/itineraries/:id/edit" element={<ItineraryForm />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/users/new" element={<UserForm />} /> {/* New route for creating users */}
                      <Route path="/users/:id/edit" element={<UserForm />} /> {/* Future route for editing users */}
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/scheduler" element={<Scheduler />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
