import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '../../styles/colors';
import { contentAPI } from '../../api';
import { LoadingSpinner } from '../../components/SharedComponents';

const ContentScreen = ({ route }) => {
  const { type } = route.params;
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  const titles = {
    customer_terms: 'Customer Terms & Conditions',
    transporter_terms: 'Transporter Terms & Conditions',
    privacy_policy: 'Privacy Policy',
    contact: 'Help & Contact',
    about_us: 'About iDOT',
    faq: 'FAQ',
  };

  useEffect(() => {
    loadContent();
  }, [type]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const response = await contentAPI.getContent(type);
      setContent(response.data.data || response.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Minimal HTML → block renderer: headings become bold lines, <br> become
  // line breaks, and <p>/<h4> become paragraphs. Good enough for the simple
  // HTML the admin panel stores, without adding a webview dependency.
  const renderBlocks = (html) => {
    if (!html) return null;

    const decoded = html
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#039;|&apos;/g, "'")
      .replace(/&quot;/g, '"');

    // Convert HTML to a flat list of {style, text} lines
    const lines = [];
    const pushLine = (text, style) => {
      const clean = text
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      if (clean) lines.push({ style, text: clean });
    };

    // Tokenize headings and paragraphs
    const regex = /<(h3|h4|p|li)[^>]*>([\s\S]*?)<\/\1>/gi;
    let match;
    let lastIndex = 0;
    while ((match = regex.exec(decoded)) !== null) {
      // Capture stray text between blocks (rare, but possible)
      const between = decoded.slice(lastIndex, match.index);
      pushLine(between, 'body');
      const tag = match[1].toLowerCase();
      const style =
        tag === 'h3' ? 'h1' : tag === 'h4' ? 'h2' : tag === 'li' ? 'li' : 'body';
      pushLine(match[2], style);
      lastIndex = regex.lastIndex;
    }
    pushLine(decoded.slice(lastIndex), 'body');

    return lines.map((line, i) => (
      <Text
        key={i}
        style={
          line.style === 'h1'
            ? styles.h1
            : line.style === 'h2'
            ? styles.h2
            : line.style === 'li'
            ? styles.li
            : styles.body
        }
      >
        {line.text}
      </Text>
    ));
  };

  if (loading) return <LoadingSpinner />;
  if (!content) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Content not available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{content.title || titles[type] || 'Content'}</Text>
        {renderBlocks(content.content || content.body) || (
          <Text style={styles.body}>No content available.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 18,
    lineHeight: 30,
  },
  h1: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginTop: 20,
    marginBottom: 8,
  },
  h2: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 6,
  },
  body: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 10,
  },
  li: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 6,
    paddingLeft: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default ContentScreen;
