<script setup lang="ts">
import { computed } from 'vue';
import { buildPieSlices, type PieSlice } from './displayUtils';

function sliceTooltip(slice: PieSlice) {
  return `${slice.label}: ${slice.value.toLocaleString()}`;
}

const props = withDefaults(defineProps<{
  items: Record<string, unknown>[] | null;
  valueColumn?: string;
  labelColumn?: string;
  showLegend?: boolean;
  showValues?: boolean;
}>(), {
  showLegend: true,
  showValues: true,
});

const slices = computed(() => {
  if (!props.items?.length || !props.valueColumn) return [];
  return buildPieSlices(props.items, props.valueColumn, props.labelColumn);
});

const hasData = computed(() => slices.value.length > 0);
</script>

<template>
  <div class="pie-chart-display">
    <v-notice v-if="!valueColumn" type="warning" center>
      Please configure a value column.
    </v-notice>
    <v-notice v-else-if="!hasData" type="warning" center>
      No numeric data for pie chart.
    </v-notice>
    <div v-else class="pie-chart-content">
      <svg class="pie-chart" viewBox="0 0 100 100" role="img" aria-label="Pie chart">
        <g
          v-for="(slice, index) in slices"
          :key="index"
          v-tooltip="sliceTooltip(slice)"
          class="pie-slice-group">
          <path
            :d="slice.path"
            :fill="slice.color"
            class="pie-slice" />
        </g>
      </svg>
      <ul v-if="showLegend" class="pie-legend">
        <li v-for="(slice, index) in slices" :key="index" class="pie-legend-item">
          <span class="pie-legend-swatch" :style="{ backgroundColor: slice.color }" />
          <span class="pie-legend-label">{{ slice.label }}</span>
          <span v-if="showValues" class="pie-legend-value">{{ slice.percent.toFixed(1) }}%</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.pie-chart-display {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 12px;
  box-sizing: border-box;
}

.pie-chart-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.pie-chart {
  width: min(180px, 45%);
  height: min(180px, 100%);
  flex-shrink: 0;
}

.pie-slice-group {
  cursor: pointer;
}

.pie-slice {
  stroke: var(--background-page);
  stroke-width: 0.5;
  pointer-events: all;
}

.pie-legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.pie-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  line-height: 1.3;
}

.pie-legend-swatch {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.pie-legend-label {
  color: var(--foreground);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pie-legend-value {
  color: var(--foreground-subdued);
  font-family: var(--family-monospace);
  flex-shrink: 0;
}
</style>
