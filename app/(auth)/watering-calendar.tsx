import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '../../components/Skeleton';
import { Chip, IconButton, displayFont, ScreenHeader } from '../../components/ui';
import { usePlants } from '../../contexts/PlantContext';
import { useTheme } from '../../contexts/ThemeContext';
import * as api from '../../lib/api';

type WateringEvent = {
  id: string;
  date: string; // YYYY-MM-DD
};

export default function WateringCalendarScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { plants } = usePlants();
  const { id } = useLocalSearchParams<{ id?: string }>();
  // No id (e.g. DevMenu) -> default to the first plant.
  const plantId = id ?? plants[0]?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showOverview, setShowOverview] = useState(false);
  const [wateringEvents, setWateringEvents] = useState<WateringEvent[]>([]);

  const load = useCallback(async () => {
    if (!plantId) {
      setWateringEvents([]);
      setIsLoading(false);
      return;
    }
    try {
      const events = await api.listWateringEvents(plantId).catch(() => []);
      setWateringEvents(events.map((e) => ({ id: e.id, date: e.watered_at.split('T')[0] })));
    } finally {
      setIsLoading(false);
    }
  }, [plantId]);

  useEffect(() => {
    load();
  }, [load]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    return { daysInMonth, startDayOfWeek, year, month };
  };

  const dateStrFor = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isDateWatered = (day: number) =>
    wateringEvents.some((event) => event.date === dateStrFor(day));

  const toggleWatering = async (day: number) => {
    if (!plantId) return;
    const dateStr = dateStrFor(day);
    const existing = wateringEvents.filter((e) => e.date === dateStr);

    if (existing.length > 0) {
      // A temp entry means the create is still in flight — ignore the tap.
      if (existing.some((e) => e.id.startsWith('temp-'))) return;
      // Un-water: optimistically clear the day, delete every event on it.
      setWateringEvents((prev) => prev.filter((e) => e.date !== dateStr));
      try {
        await Promise.all(existing.map((e) => api.deleteWateringEvent(e.id)));
      } catch (e) {
        console.error('Failed to remove watering', e);
        setWateringEvents((prev) => [...prev, ...existing]); // rollback
      }
      return;
    }

    // Water: optimistic temp entry, swapped for the real id on success
    // (the id is what a later un-water needs).
    const temp = { id: `temp-${dateStr}`, date: dateStr };
    setWateringEvents((prev) => [...prev, temp]);
    try {
      const created = await api.addWateringEvent(
        plantId,
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, 12).toISOString()
      );
      setWateringEvents((prev) =>
        prev.map((ev) => (ev.id === temp.id ? { id: created.id, date: dateStr } : ev))
      );
    } catch (e) {
      console.error('Failed to log watering', e);
      setWateringEvents((prev) => prev.filter((ev) => ev.id !== temp.id)); // rollback
    }
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getMonthWateringCount = (year: number, month: number) => {
    return wateringEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    }).length;
  };

  const getYearMonths = () => {
    const currentYear = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth();
    const months = [];

    for (let i = 0; i <= currentMonthIndex; i += 1) {
      months.push({
        year: currentYear,
        month: i,
        name: monthNames[i],
        wateringCount: getMonthWateringCount(currentYear, i),
      });
    }

    return months;
  };

  const { daysInMonth, startDayOfWeek } = getDaysInMonth(currentMonth);
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const today = new Date();

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, paddingHorizontal: 20 },
    monthNavigator: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
      marginBottom: 18,
    },
    monthText: { fontSize: 20, fontFamily: displayFont, color: colors.text },
    calendar: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      shadowColor: '#1B2A21',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 2,
    },
    weekDaysRow: { flexDirection: 'row', marginBottom: 8 },
    weekDay: { flex: 1, alignItems: 'center', paddingVertical: 8 },
    weekDayText: { fontSize: 12.5, fontWeight: '700', color: colors.textSecondary },
    daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 3 },
    dayButton: {
      flex: 1,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayButtonWatered: { backgroundColor: colors.water },
    dayButtonToday: { borderWidth: 2, borderColor: colors.primary },
    dayText: { fontSize: 14, color: colors.text },
    dayTextWatered: { color: '#ffffff', fontWeight: '700' },
    legendRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
    overviewToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      marginTop: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    overviewToggleText: { fontSize: 15, fontWeight: '700', color: colors.text },
    yearOverview: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      marginTop: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    monthsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    monthChip: {
      width: `${(100 - 3 * 8) / 4}%`,
      backgroundColor: colors.background,
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    monthChipActive: { borderColor: colors.primary, borderWidth: 2 },
    monthChipName: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 6 },
    monthChipCount: { fontSize: 18, fontFamily: displayFont, color: colors.water },
    monthChipLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Calendário de rega" />
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
          <View style={styles.monthNavigator}>
            <Skeleton width={40} height={40} borderRadius={20} />
            <Skeleton width={150} height={24} />
            <Skeleton width={40} height={40} borderRadius={20} />
          </View>

          <View style={styles.calendar}>
            <View style={styles.weekDaysRow}>
              {Array.from({ length: 7 }).map((_, index) => (
                <View key={index} style={styles.weekDay}>
                  <Skeleton width={14} height={14} />
                </View>
              ))}
            </View>
            <View style={styles.daysGrid}>
              {Array.from({ length: 35 }).map((_, index) => (
                <View key={index} style={styles.dayCell}>
                  <Skeleton height={38} borderRadius={19} />
                </View>
              ))}
            </View>
          </View>

          <View style={styles.legendRow}>
            <Skeleton width={110} height={28} borderRadius={14} />
            <Skeleton width={90} height={28} borderRadius={14} />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Calendário de rega" />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View style={styles.monthNavigator}>
          <IconButton icon="chevron-back" onPress={() => changeMonth('prev')} />
          <Text style={styles.monthText}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <IconButton icon="chevron-forward" onPress={() => changeMonth('next')} />
        </View>

        <View style={styles.calendar}>
          <View style={styles.weekDaysRow}>
            {weekDays.map((day, index) => (
              <View key={`${day}-${index}`} style={styles.weekDay}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {Array.from({ length: startDayOfWeek }).map((_, index) => (
              <View key={`empty-${index}`} style={styles.dayCell} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const watered = isDateWatered(day);
              const todayDate = isToday(day);

              return (
                <View key={day} style={styles.dayCell}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.dayButton,
                      watered && styles.dayButtonWatered,
                      todayDate && styles.dayButtonToday,
                      pressed && !watered && { backgroundColor: colors.waterSoft },
                    ]}
                    onPress={() => toggleWatering(day)}
                  >
                    <Text style={[styles.dayText, watered && styles.dayTextWatered]}>
                      {day}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.legendRow}>
          <Chip icon="water" label="Dia com rega" color={colors.water} background={colors.waterSoft} />
          <Chip icon="ellipse-outline" label="Hoje" color={colors.primary} background={colors.primarySoft} />
        </View>

        <Pressable
          style={styles.overviewToggle}
          onPress={() => setShowOverview(!showOverview)}
        >
          <Text style={styles.overviewToggleText}>Visão anual {new Date().getFullYear()}</Text>
          <Ionicons
            name={showOverview ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textSecondary}
          />
        </Pressable>

        {showOverview && (
          <View style={styles.yearOverview}>
            <View style={styles.monthsGrid}>
              {getYearMonths().map((monthData) => {
                const isCurrentMonth =
                  monthData.month === currentMonth.getMonth() &&
                  monthData.year === currentMonth.getFullYear();

                return (
                  <Pressable
                    key={`${monthData.year}-${monthData.month}`}
                    style={[styles.monthChip, isCurrentMonth && styles.monthChipActive]}
                    onPress={() => {
                      const newDate = new Date(monthData.year, monthData.month, 1);
                      setCurrentMonth(newDate);
                      setShowOverview(false);
                    }}
                  >
                    <Text style={styles.monthChipName}>{monthData.name.substring(0, 3)}</Text>
                    <Text style={styles.monthChipCount}>{monthData.wateringCount}</Text>
                    <Text style={styles.monthChipLabel}>regas</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
