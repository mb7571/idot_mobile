import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { contentAPI } from '../../services/api';

const ContentScreen = ({ route }) => {
  const { type, title } = route.params;
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadContent();
  }, [type]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contentAPI.getContent(type);
      setContent(response.data.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setContent({
          title: title || 'Content',
          content: 'This content is not available yet. Please check back later.',
        });
      } else {
        setError('Failed to load content. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{content?.title || title}</Text>
      <Text style={styles.body}>{content?.content || 'No content available.'}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default ContentScreen;
