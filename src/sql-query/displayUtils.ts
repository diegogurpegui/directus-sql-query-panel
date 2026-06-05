export type ValueFormat = 'auto' | 'number' | 'percent';
export type ValueSize = 'sm' | 'md' | 'lg' | 'xl';
export type ValueLayout = 'single' | 'multiple';

export type ValueRow = {
  label: string | null;
  value: unknown;
  displayValue: string;
  isNumeric: boolean;
};

export const VALUE_SIZE_REM: Record<ValueSize, string> = {
  sm: '1.25rem',
  md: '2rem',
  lg: '3rem',
  xl: '4rem',
};

export const PIE_COLORS = [
  'var(--primary)',
  'var(--secondary)',
  '#6644ff',
  '#2ecda7',
  '#ffc23b',
  '#e35169',
  '#3399ff',
  '#18222f',
];

export type PieSlice = {
  label: string;
  value: number;
  percent: number;
  color: string;
  path: string;
};

export function coerceNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

export function getColumnValue(
  items: Record<string, unknown>[] | null,
  column: string | undefined
): unknown {
  if (!items?.length || !column) return undefined;
  return items[0][column];
}

export function formatDisplayValue(
  value: unknown,
  format: ValueFormat = 'auto'
): string {
  if (value === null || value === undefined) return '—';

  const num = coerceNumber(value);

  if (format === 'number' && num !== null) {
    return num.toLocaleString();
  }

  if (format === 'percent' && num !== null) {
    return `${num.toLocaleString()}%`;
  }

  return String(value);
}

export function isNumericDisplayValue(value: unknown, format: ValueFormat = 'auto'): boolean {
  if (format === 'number' || format === 'percent') return true;
  return coerceNumber(value) !== null;
}

export function buildValueRows(
  items: Record<string, unknown>[] | null,
  valueColumn: string | undefined,
  labelColumn: string | undefined,
  format: ValueFormat = 'auto',
  layout: ValueLayout = 'single'
): ValueRow[] {
  if (!items?.length || !valueColumn) return [];

  const rows = layout === 'single' ? items.slice(0, 1) : items;

  return rows
    .map((row, index) => {
      if (!(valueColumn in row)) return null;

      const value = row[valueColumn];
      const label = labelColumn && labelColumn in row && row[labelColumn] != null && row[labelColumn] !== ''
        ? String(row[labelColumn])
        : layout === 'multiple'
          ? `Row ${index + 1}`
          : null;

      return {
        label,
        value,
        displayValue: formatDisplayValue(value, format),
        isNumeric: isNumericDisplayValue(value, format),
      };
    })
    .filter((row): row is ValueRow => row !== null);
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

export function buildPieSlices(
  items: Record<string, unknown>[],
  valueColumn: string,
  labelColumn?: string
): PieSlice[] {
  const entries: { label: string; value: number }[] = [];

  items.forEach((row, index) => {
    const value = coerceNumber(row[valueColumn]);
    if (value === null || value <= 0) return;

    const label = labelColumn && row[labelColumn] != null && row[labelColumn] !== ''
      ? String(row[labelColumn])
      : `Slice ${index + 1}`;

    entries.push({ label, value });
  });

  const total = entries.reduce((sum, entry) => sum + entry.value, 0);
  if (!total) return [];

  const cx = 50;
  const cy = 50;
  const r = 45;
  let angle = 0;

  return entries.map((entry, index) => {
    const sliceAngle = (entry.value / total) * 360;
    const path = describeArc(cx, cy, r, angle, angle + sliceAngle);
    angle += sliceAngle;

    return {
      label: entry.label,
      value: entry.value,
      percent: (entry.value / total) * 100,
      color: PIE_COLORS[index % PIE_COLORS.length],
      path,
    };
  });
}
