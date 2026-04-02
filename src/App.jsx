import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyDetails from './pages/PropertyDetails';
import SearchResults from './pages/SearchResults';
import CompareProperties from './pages/CompareProperties';

// User Pages
import Wishlist from './pages/Wishlist';
import UserDashboard from './pages/user/UserDashboard';
import PostComplaint from './pages/user/PostComplaint';
import ViewComplaintStatus from './pages/user/ViewComplaintStatus';
import PostFeedback from './pages/user/PostFeedback';
import UserProfile from './pages/user/UserProfile';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import ManageProperties from './pages/owner/ManageProperties';
import AddProperty from './pages/owner/AddProperty';
import EditProperty from './pages/owner/EditProperty';
import ViewEnquiries from './pages/owner/ViewEnquiries';
import ViewComplaints from './pages/owner/ViewComplaints';
import ViewFeedback from './pages/owner/ViewFeedback';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import AdminManageProperties from './pages/admin/ManageProperties';
import ApproveListings from './pages/admin/ApproveListings';
import DatabaseSeeder from './pages/admin/DatabaseSeeder';

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/compare" element={<CompareProperties />} />

          {/* User Routes */}
          <Route path="/wishlist" element={
            <ProtectedRoute role="user"><Wishlist /></ProtectedRoute>
          } />
          <Route path="/user/dashboard" element={
            <ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>
          } />
          <Route path="/user/complaint" element={
            <ProtectedRoute role="user"><PostComplaint /></ProtectedRoute>
          } />
          <Route path="/user/complaint-status" element={
            <ProtectedRoute role="user"><ViewComplaintStatus /></ProtectedRoute>
          } />
          <Route path="/user/feedback" element={
            <ProtectedRoute role="user"><PostFeedback /></ProtectedRoute>
          } />
          <Route path="/user/profile" element={
            <ProtectedRoute role="user"><UserProfile /></ProtectedRoute>
          } />

          {/* Owner Routes */}
          <Route path="/owner/dashboard" element={
            <ProtectedRoute role="owner"><OwnerDashboard /></ProtectedRoute>
          } />
          <Route path="/owner/properties" element={
            <ProtectedRoute role="owner"><ManageProperties /></ProtectedRoute>
          } />
          <Route path="/owner/add-property" element={
            <ProtectedRoute role="owner"><AddProperty /></ProtectedRoute>
          } />
          <Route path="/owner/edit-property/:id" element={
            <ProtectedRoute role="owner"><EditProperty /></ProtectedRoute>
          } />
          <Route path="/owner/enquiries" element={
            <ProtectedRoute role="owner"><ViewEnquiries /></ProtectedRoute>
          } />
          <Route path="/owner/complaints" element={
            <ProtectedRoute role="owner"><ViewComplaints /></ProtectedRoute>
          } />
          <Route path="/owner/feedback" element={
            <ProtectedRoute role="owner"><ViewFeedback /></ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute role="admin"><ManageUsers /></ProtectedRoute>
          } />
          <Route path="/admin/properties" element={
            <ProtectedRoute role="admin"><AdminManageProperties /></ProtectedRoute>
          } />
          <Route path="/admin/approve" element={
            <ProtectedRoute role="admin"><ApproveListings /></ProtectedRoute>
          } />
          <Route path="/admin/seed-data" element={
            <ProtectedRoute role="admin"><DatabaseSeeder /></ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
