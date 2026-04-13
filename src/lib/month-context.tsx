import React, { createContext, useContext, useState } from 'react';

interface MonthContextType {
  selectedYear: number;
  selectedMonth: number;
  setSelectedYear: (y: number) => void;
  setSelectedMonth: (m: number) => void;
  prevMonth: () => void;
  nextMonth: () => void;
}

const MonthContext = createContext<MonthContextType | null>(null);

export const MonthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  return (
    <MonthContext.Provider value={{ selectedYear, selectedMonth, setSelectedYear, setSelectedMonth, prevMonth, nextMonth }}>
      {children}
    </MonthContext.Provider>
  );
};

export const useMonth = () => {
  const ctx = useContext(MonthContext);
  if (!ctx) throw new Error('useMonth must be inside MonthProvider');
  return ctx;
};
