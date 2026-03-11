import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

type WateringEvent = {
  date: string; // YYYY-MM-DD
  watered: boolean;
};

export default function WateringCalendarScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showOverview, setShowOverview] = useState(false);
  const [wateringEvents, setWateringEvents] = useState<WateringEvent[]>([
    { date: '2026-01-15', watered: true },
    { date: '2026-01-18', watered: true },
    { date: '2026-01-22', watered: true },
    { date: '2026-02-03', watered: true },
    { date: '2026-02-10', watered: true },
    { date: '2026-02-17', watered: true },
    { date: '2026-02-24', watered: true },
    { date: '2026-03-05', watered: true },
    { date: '2026-03-08', watered: true },
    { date: '2026-03-11', watered: true },
  ]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
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

  const isDateWatered = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return wateringEvents.some(event => event.date === dateStr && event.watered);
  };

  const toggleWatering = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    setWateringEvents(prev => {
      const existingIndex = prev.findIndex(e => e.date === dateStr);
      if (existingIndex >= 0) {
        return prev.filter((_, i) => i !== existingIndex);
      } else {
        return [...prev, { date: dateStr, watered: true }];
      }
    });
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
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
    const count = wateringEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    }).length;
    return count;
  };

  const getYearMonths = () => {
    const currentYear = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth();
    const months = [];
    
    for (let i = 0; i <= currentMonthIndex; i++) {
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backButtonText: {
      fontSize: 20,
      color: colors.text,
    },
    headerTitle: {
      flex: 1,
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    overviewToggle: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    overviewToggleText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    overviewToggleIcon: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    yearOverview: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    yearOverviewTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    monthsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    monthChip: {
      width: `${(100 - 3 * 8) / 4}%`,
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    monthChipActive: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    monthChipName: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
    },
    monthChipCount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
    },
    monthChipLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
    },
    monthNavigator: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    navButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navButtonText: {
      fontSize: 20,
      color: colors.text,
    },
    monthText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    calendar: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    weekDaysRow: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    weekDay: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
    },
    weekDayText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    daysGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      padding: 4,
    },
    dayButton: {
      flex: 1,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    dayButtonWatered: {
      backgroundColor: colors.primary,
    },
    dayButtonToday: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    dayText: {
      fontSize: 14,
      color: colors.text,
    },
    dayTextWatered: {
      color: '#ffffff',
      fontWeight: 'bold',
    },
    legend: {
      marginTop: 24,
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    legendTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    legendBox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      marginRight: 12,
    },
    legendBoxWatered: {
      backgroundColor: colors.primary,
    },
    legendBoxEmpty: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    legendText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  });

  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable  style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable >
        <Text style={styles.headerTitle}>💧 Calendário de Rega</Text>
      </View>

      <ScrollView style={styles.content}>
        <Pressable  
          style={styles.overviewToggle}
          onPress={() => setShowOverview(!showOverview)}
        >
          <Text style={styles.overviewToggleText}>📊 Visão Anual {new Date().getFullYear()}</Text>
          <Text style={styles.overviewToggleIcon}>{showOverview ? '▼' : '▶'}</Text>
        </Pressable >

        {showOverview && (
          <View style={styles.yearOverview}>
            <Text style={styles.yearOverviewTitle}>Resumo de Rega por Mês</Text>
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
                  </Pressable >
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.monthNavigator}>
          <Pressable  style={styles.navButton} onPress={() => changeMonth('prev')}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable >
          <Text style={styles.monthText}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <Pressable  style={styles.navButton} onPress={() => changeMonth('next')}>
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </Pressable >
        </View>

        <View style={styles.calendar}>
          <View style={styles.weekDaysRow}>
            {weekDays.map((day, index) => (
              <View key={index} style={styles.weekDay}>
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
                    style={[
                      styles.dayButton,
                      watered && styles.dayButtonWatered,
                      todayDate && styles.dayButtonToday,
                    ]}
                    onPress={() => toggleWatering(day)}
                  >
                    <Text style={[styles.dayText, watered && styles.dayTextWatered]}>
                      {day}
                    </Text>
                  </Pressable >
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legenda</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.legendBoxWatered]} />
            <Text style={styles.legendText}>Dia que você regou</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.legendBoxEmpty]} />
            <Text style={styles.legendText}>Dia sem rega</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
