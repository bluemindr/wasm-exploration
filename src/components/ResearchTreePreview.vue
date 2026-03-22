<template>
  <div class="space-y-3">
    <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="text-xs uppercase tracking-[0.18em] text-slate-500">
            {{ pathLabel }}
          </div>
          <div class="mt-1 text-lg font-bold text-slate-900">
            {{ node.player.toUpperCase() }}
          </div>
        </div>
        <div v-if="node.note" class="text-sm text-slate-500">
          {{ node.note }}
        </div>
      </div>

      <div v-if="node.actionLabels.length > 0" class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="(label, index) in node.actionLabels"
          :key="`${pathLabel}-${label}-${index}`"
          class="rounded-xl border border-slate-200 bg-white px-3 py-3"
        >
          <div class="text-sm font-semibold text-slate-900">{{ label }}</div>
          <div class="mt-1 text-xs text-slate-500">
            {{ formatPercent(node.actionFrequencies[index] ?? 0) }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="node.children.length > 0" class="border-l-2 border-slate-200 pl-4">
      <ResearchTreePreview
        v-for="(child, index) in node.children"
        :key="`${pathLabel}-child-${index}`"
        :node="child"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import type { DecisionTreeNode } from "../lib/research-solver";

const formatPercent = (value: number) => {
  if (!isFinite(value)) return "-";
  return `${(value * 100).toFixed(1)}%`;
};

export default defineComponent({
  name: "ResearchTreePreview",
  props: {
    node: {
      type: Object as PropType<DecisionTreeNode>,
      required: true,
    },
  },
  setup(props) {
    const pathLabel = computed(() =>
      props.node.path.length > 0 ? props.node.path.join(" -> ") : "Root"
    );

    return {
      pathLabel,
      formatPercent,
    };
  },
});
</script>
