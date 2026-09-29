import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../styles/colors';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const toKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;

/**
 * CalendarPicker — lightweight custom date picker modal (no native deps).
 *
 * - Month grid with prev/next navigation
 * - Past dates disabled
 * - Optional preset chips (Today / Tomorrow / This Weekend)
 * - Returns 'YYYY-MM-DD' via onConfirm(dateString)
 */
const CalendarPicker = ({
  visible,
  onClose,
  onConfirm,
  title = 'Select Date',
  value,
  presets = true,
  minDate, // 'YYYY-MM-DD' — defaults to today
}) => {
  const today = useMemo(() => new Date(), []);
  const todayKey = toKey(today);
  const minKey = minDate || todayKey;

  const [viewMonth, setViewMonth] = useState(
    value ? new Date(`${value}T00:00:00`) : new Date(),
  );
  const [selected, setSelected] = useState(value || null);

  // Re-sync when reopened
  React.useEffect(() => {
    if (visible) {
      setSelected(value || null);
      setViewMonth(value ? new Date(`${value}T00:00:00`) : new Date());
    }
  }, [visible, value]);

  const minDateObj = useMemo(() => {
    const [y, m, d] = minKey.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [minKey]);

  const daysGrid = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewMonth]);

  const goPrev = () =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  const goNext = () =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));

  const canGoPrev =
    viewMonth.getFullYear() > minDateObj.getFullYear() ||
    (viewMonth.getFullYear() === minDateObj.getFullYear() &&
      viewMonth.getMonth() > minDateObj.getMonth());

  const buildPresets = () => {
    const list = [];
    const add = (label, date) =>
      list.push({ label, key: toKey(date), date });

    const todayD = new Date(today);
    add('Today', todayD);

    const tomorrowD = new Date(today);
    tomorrowD.setDate(tomorrowD.getDate() + 1);
    add('Tomorrow', tomorrowD);

    // This weekend (upcoming Saturday, or today if Saturday/Sunday)
    const weekend = new Date(today);
    const day = weekend.getDay();
    const delta = day === 6 ? 0 : day === 0 ? -1 : 6 - day;
    weekend.setDate(weekend.getDate() + delta);
    add('This Weekend', weekend);

    return list;
  };

  const handlePick = (day) => {
    const date = new Date(
      viewMonth.getFullYear(),
      viewMonth.getMonth(),
      day,
    );
    const key = toKey(date);
    if (key < minKey) return;
    setSelected(key);
  };

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm?.(selected);
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Presets */}
          {presets && (
            <View style={styles.presetsRow}>
              {buildPresets().map((p) => (
                <TouchableOpacity
                  key={p.label}
                  style={[styles.presetChip, selected === p.key && styles.presetChipActive]}
                  onPress={() => setSelected(p.key)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.presetText,
                      selected === p.key && styles.presetTextActive,
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Month navigation */}
          <View style={styles.monthRow}>
            <TouchableOpacity
              onPress={goPrev}
              disabled={!canGoPrev}
              style={[styles.navBtn, !canGoPrev && styles.navBtnDisabled]}
            >
              <Text style={[styles.navText, !canGoPrev && styles.navTextDisabled]}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthLabel}>
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </Text>
            <TouchableOpacity onPress={goNext} style={styles.navBtn}>
              <Text style={styles.navText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Weekday header */}
          <View style={styles.weekRow}>
            {WEEKDAYS.map((w) => (
              <Text key={w} style={styles.weekDay}>
                {w}
              </Text>
            ))}
          </View>

          {/* Days grid */}
          <View style={styles.grid}>
            {daysGrid.map((day, idx) => {
              if (day === null) return <View key={`e${idx}`} style={styles.dayCell} />;
              const dateKey = toKey(
                new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day),
              );
              const isPast = dateKey < minKey;
              const isSelected = selected === dateKey;
              const isToday = dateKey === todayKey;

              return (
                <TouchableOpacity
                  key={dateKey}
                  style={[
                    styles.dayCell,
                    isSelected && styles.daySelected,
                    isToday && !isSelected && styles.dayToday,
                  ]}
                  onPress={() => handlePick(day)}
                  disabled={isPast}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isPast && styles.dayTextPast,
                      isSelected && styles.dayTextSelected,
                      isToday && !isSelected && styles.dayTextToday,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.okBtn, !selected && styles.okBtnDisabled]}
              onPress={handleConfirm}
              disabled={!selected}
            >
              <Text style={styles.okText}>
                {selected ? `Set ${selected}` : 'Pick a date'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: { fontSize: 14, fontWeight: '700', color: COLORS.text },

  // Presets
  presetsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  presetChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.gray50,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  presetChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  presetText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  presetTextActive: { color: COLORS.primaryDark },

  // Month nav
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnDisabled: { opacity: 0.35 },
  navText: { fontSize: 22, fontWeight: '700', color: COLORS.primary, marginTop: -2 },
  navTextDisabled: { color: COLORS.gray400 },

  // Weekdays
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  daySelected: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  dayToday: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
  },
  dayText: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  dayTextPast: { color: COLORS.gray300 },
  dayTextSelected: { color: COLORS.white, fontWeight: '800' },
  dayTextToday: { color: COLORS.primaryDark, fontWeight: '800' },

  // Footer
  footer: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
  },
  cancelText: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
  okBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  okBtnDisabled: { backgroundColor: COLORS.gray300 },
  okText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});

export default CalendarPicker;
