'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HierarchySelection, HierarchyLevel } from '@/types';

interface HierarchyContextValue {
  selection: HierarchySelection;
  setLevel: (level: HierarchyLevel) => void;
  setZone: (zoneId: string, zoneName: string) => void;
  setArea: (areaId: string, areaName: string) => void;
  setParish: (parishId: string, parishName: string) => void;
  resetToProvince: () => void;
  breadcrumbs: { label: string; level: HierarchyLevel }[];
}

const defaultSelection: HierarchySelection = {
  level: 'province',
  provinceId: '',
  provinceName: 'Rivers Province 10',
  zoneId: null,
  zoneName: null,
  areaId: null,
  areaName: null,
  parishId: null,
  parishName: null,
};

const HierarchyContext = createContext<HierarchyContextValue | null>(null);

export function HierarchyProvider({ children, provinceId }: { children: ReactNode; provinceId: string }) {
  const [selection, setSelection] = useState<HierarchySelection>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hierarchySelection');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fall through
        }
      }
    }
    return { ...defaultSelection, provinceId };
  });

  useEffect(() => {
    localStorage.setItem('hierarchySelection', JSON.stringify(selection));
  }, [selection]);

  const setLevel = (level: HierarchyLevel) => {
    setSelection((prev) => ({ ...prev, level }));
  };

  const setZone = (zoneId: string, zoneName: string) => {
    setSelection((prev) => ({
      ...prev,
      level: 'zone',
      zoneId,
      zoneName,
      areaId: null,
      areaName: null,
      parishId: null,
      parishName: null,
    }));
  };

  const setArea = (areaId: string, areaName: string) => {
    setSelection((prev) => ({
      ...prev,
      level: 'area',
      areaId,
      areaName,
      parishId: null,
      parishName: null,
    }));
  };

  const setParish = (parishId: string, parishName: string) => {
    setSelection((prev) => ({
      ...prev,
      level: 'parish',
      parishId,
      parishName,
    }));
  };

  const resetToProvince = () => {
    setSelection({
      ...defaultSelection,
      provinceId: selection.provinceId,
    });
  };

  const breadcrumbs: { label: string; level: HierarchyLevel }[] = [
    { label: selection.provinceName, level: 'province' },
  ];
  if (selection.zoneName) breadcrumbs.push({ label: selection.zoneName, level: 'zone' });
  if (selection.areaName) breadcrumbs.push({ label: selection.areaName, level: 'area' });
  if (selection.parishName) breadcrumbs.push({ label: selection.parishName, level: 'parish' });

  return (
    <HierarchyContext.Provider
      value={{ selection, setLevel, setZone, setArea, setParish, resetToProvince, breadcrumbs }}
    >
      {children}
    </HierarchyContext.Provider>
  );
}

export function useHierarchy() {
  const context = useContext(HierarchyContext);
  if (!context) {
    throw new Error('useHierarchy must be used within a HierarchyProvider');
  }
  return context;
}
