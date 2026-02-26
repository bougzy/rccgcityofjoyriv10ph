'use client';

import { useState, useEffect } from 'react';
import { useHierarchy } from '@/lib/contexts/HierarchyContext';
import { cn } from '@/lib/utils/cn';
import { ChevronRight, RotateCcw, Building2 } from 'lucide-react';

interface ZoneOption {
  _id: string;
  name: string;
}

interface AreaOption {
  _id: string;
  name: string;
}

interface ParishOption {
  _id: string;
  name: string;
}

export default function HierarchySwitcher() {
  const { selection, setZone, setArea, setParish, resetToProvince, breadcrumbs } = useHierarchy();

  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [parishes, setParishes] = useState<ParishOption[]>([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingParishes, setLoadingParishes] = useState(false);

  // Fetch zones on mount
  useEffect(() => {
    const fetchZones = async () => {
      setLoadingZones(true);
      try {
        const res = await fetch('/api/hierarchy/zones');
        if (res.ok) {
          const data = await res.json();
          setZones(data);
        }
      } catch {
        // Zones could not be loaded
      } finally {
        setLoadingZones(false);
      }
    };
    fetchZones();
  }, []);

  // Fetch areas when zone changes
  useEffect(() => {
    if (!selection.zoneId) {
      setAreas([]);
      return;
    }

    const fetchAreas = async () => {
      setLoadingAreas(true);
      try {
        const res = await fetch(`/api/hierarchy/areas?zone=${selection.zoneId}`);
        if (res.ok) {
          const data = await res.json();
          setAreas(data);
        }
      } catch {
        // Areas could not be loaded
      } finally {
        setLoadingAreas(false);
      }
    };
    fetchAreas();
  }, [selection.zoneId]);

  // Fetch parishes when area changes
  useEffect(() => {
    if (!selection.areaId) {
      setParishes([]);
      return;
    }

    const fetchParishes = async () => {
      setLoadingParishes(true);
      try {
        const res = await fetch(`/api/hierarchy/parishes?area=${selection.areaId}`);
        if (res.ok) {
          const data = await res.json();
          setParishes(data);
        }
      } catch {
        // Parishes could not be loaded
      } finally {
        setLoadingParishes(false);
      }
    };
    fetchParishes();
  }, [selection.areaId]);

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const zoneId = e.target.value;
    if (!zoneId) {
      resetToProvince();
      return;
    }
    const zone = zones.find((z) => z._id === zoneId);
    if (zone) {
      setZone(zone._id, zone.name);
    }
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const areaId = e.target.value;
    if (!areaId) {
      // Reset back to zone level
      if (selection.zoneId && selection.zoneName) {
        setZone(selection.zoneId, selection.zoneName);
      }
      return;
    }
    const area = areas.find((a) => a._id === areaId);
    if (area) {
      setArea(area._id, area.name);
    }
  };

  const handleParishChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const parishId = e.target.value;
    if (!parishId) {
      // Reset back to area level
      if (selection.areaId && selection.areaName) {
        setArea(selection.areaId, selection.areaName);
      }
      return;
    }
    const parish = parishes.find((p) => p._id === parishId);
    if (parish) {
      setParish(parish._id, parish.name);
    }
  };

  const selectClasses =
    'px-3 py-1.5 rounded-xl glass-input text-slate-900 dark:text-white text-sm focus:outline-none min-w-[120px] sm:min-w-[140px]';

  return (
    <div className="space-y-2">
      {/* Cascading dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Building2 size={14} className="text-slate-400" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Scope:
          </span>
        </div>

        {/* Province (fixed) */}
        <select
          disabled
          className={cn(selectClasses, 'opacity-70 cursor-not-allowed')}
          value="province"
        >
          <option value="province">Rivers Province 10</option>
        </select>

        <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />

        {/* Zone */}
        <select
          value={selection.zoneId || ''}
          onChange={handleZoneChange}
          className={selectClasses}
          disabled={loadingZones}
        >
          <option value="">All Zones</option>
          {zones.map((zone) => (
            <option key={zone._id} value={zone._id}>
              {zone.name}
            </option>
          ))}
        </select>

        {selection.zoneId && (
          <>
            <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />

            {/* Area */}
            <select
              value={selection.areaId || ''}
              onChange={handleAreaChange}
              className={selectClasses}
              disabled={loadingAreas}
            >
              <option value="">All Areas</option>
              {areas.map((area) => (
                <option key={area._id} value={area._id}>
                  {area.name}
                </option>
              ))}
            </select>
          </>
        )}

        {selection.areaId && (
          <>
            <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />

            {/* Parish */}
            <select
              value={selection.parishId || ''}
              onChange={handleParishChange}
              className={selectClasses}
              disabled={loadingParishes}
            >
              <option value="">All Parishes</option>
              {parishes.map((parish) => (
                <option key={parish._id} value={parish._id}>
                  {parish.name}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Reset button */}
        {selection.level !== 'province' && (
          <button
            onClick={resetToProvince}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Reset to Province"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>

      {/* Breadcrumb trail */}
      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.level} className="flex items-center gap-1">
            {index > 0 && <ChevronRight size={10} className="text-slate-300 dark:text-slate-600" />}
            <span
              className={cn(
                index === breadcrumbs.length - 1
                  ? 'font-semibold text-primary dark:text-primary-light'
                  : 'text-slate-400 dark:text-slate-500'
              )}
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
