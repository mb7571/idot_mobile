import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Custom toast styles for react-native-toast-message.
 * Currently only the amber 'warn' variant used by low-searches warnings.
 */
export const toastConfig = {
  warn: ({ text1, text2, onPress }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.bar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{text1}</Text>
          {text2 ? <Text style={styles.msg}>{text2}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  ),
};

const styles = StyleSheet.create({
  wrap: {
    width: '92%',
    alignSelf: 'center',
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  bar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    backgroundColor: '#F59E0B',
  },
  title: { fontSize: 14, fontWeight: '800', color: '#92400E' },
  msg: { fontSize: 12.5, color: '#A16207', marginTop: 2 },
});
