import { Alert } from 'react-native';
import { getApiBaseUrl } from '../config/api';

// Build full URL for transporter logo
export const getLogoUrl = (logoPath) => {
  if (!logoPath) return null;
  // If it's already a full URL, return as-is
  if (logoPath.startsWith('http')) return logoPath;
  // Otherwise prepend the storage base URL
  return `${getApiBaseUrl()}/storage/${logoPath}`;
};

// Format mobile number for display
export const formatMobile = (mobile) => {
  if (!mobile) return '';
  const cleaned = mobile.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return mobile;
};

// Validate mobile number (Indian format)
export const isValidMobile = (mobile) => {
  const cleaned = mobile.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Format datetime
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get status color and label
export const getStatusInfo = (status) => {
  const statuses = {
    pending: { color: '#F59E0B', bg: '#FEF3C7', label: 'Pending' },
    approved: { color: '#10B981', bg: '#D1FAE5', label: 'Approved' },
    verified: { color: '#10B981', bg: '#D1FAE5', label: 'Verified' },
    rejected: { color: '#EF4444', bg: '#FEE2E2', label: 'Rejected' },
    accepted: { color: '#10B981', bg: '#D1FAE5', label: 'Accepted' },
    declined: { color: '#EF4444', bg: '#FEE2E2', label: 'Declined' },
    completed: { color: '#2563EB', bg: '#DBEAFE', label: 'Completed' },
    cancelled: { color: '#6B7280', bg: '#F3F4F6', label: 'Cancelled' },
  };
  return statuses[status] || { color: '#6B7280', bg: '#F3F4F6', label: status || 'Unknown' };
};

// Show confirmation alert
export const confirmAlert = (title, message) => {
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Confirm', onPress: () => resolve(true) },
    ]);
  });
};

// Truncate text
export const truncate = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength) + '...';
};
