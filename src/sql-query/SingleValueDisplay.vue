<script setup lang="ts">
import { computed } from 'vue';
import {
  buildValueRows,
  VALUE_SIZE_REM,
  type ValueFormat,
  type ValueLayout,
  type ValueSize,
} from './displayUtils';

const props = withDefaults(defineProps<{
  items: Record<string, unknown>[] | null;
  valueColumn?: string;
  labelColumn?: string;
  layout?: ValueLayout;
  size?: ValueSize;
  format?: ValueFormat;
}>(), {
  valueColumn: 'value',
  layout: 'single',
  size: 'lg',
  format: 'auto',
});

const rows = computed(() =>
  buildValueRows(props.items, props.valueColumn, props.labelColumn, props.format, props.layout)
);

const fontSize = computed(() => VALUE_SIZE_REM[props.size] || VALUE_SIZE_REM.lg);
</script>

<template>
  <div class="single-value-display">
    <v-notice v-if="!valueColumn" type="warning" center>
      Please configure a value column.
    </v-notice>
    <v-notice v-else-if="!items?.length" type="warning" center>
      No data returned.
    </v-notice>
    <v-notice v-else-if="!rows.length" type="warning" center>
      Column "{{ valueColumn }}" not found in results.
    </v-notice>

    <div v-else-if="layout === 'single'" class="single-value-content">
      <div v-if="rows[0].label" class="single-value-label">{{ rows[0].label }}</div>
      <div
        class="single-value"
        :class="{ numeric: rows[0].isNumeric }"
        :style="{ fontSize }">
        {{ rows[0].displayValue }}
      </div>
    </div>

    <ul v-else class="multiple-value-list">
      <li v-for="(row, index) in rows" :key="index" class="multiple-value-item">
        <span class="multiple-value-label">{{ row.label }}</span>
        <span
          class="multiple-value"
          :class="{ numeric: row.isNumeric }"
          :style="{ fontSize }">
          {{ row.displayValue }}
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.single-value-display {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: auto;
}

.single-value-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  text-align: center;
}

.single-value-label,
.multiple-value-label {
  color: var(--foreground-subdued);
  font-size: 14px;
  line-height: 1.4;
}

.single-value,
.multiple-value {
  color: var(--foreground);
  font-weight: 600;
  line-height: 1.2;
  word-break: break-word;
}

.single-value.numeric,
.multiple-value.numeric {
  font-family: var(--family-monospace);
}

.multiple-value-list {
  list-style: none;
  margin: 0;
  padding: 16px;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.multiple-value-item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}

.multiple-value-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.multiple-value {
  flex-shrink: 0;
  text-align: right;
}
</style>
