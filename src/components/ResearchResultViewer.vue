<template>
  <div class="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_26%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
    <div class="mx-auto max-w-screen-xl px-6 py-6">
      <div v-if="isLoading" class="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Loading persisted flop result...
      </div>

      <div v-else-if="loadError" class="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700 shadow-sm">
        {{ loadError }}
      </div>

      <div v-else-if="recordValue" class="space-y-6">
        <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div class="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                Research Result
              </div>
              <h1 class="mt-2 text-4xl font-black tracking-tight text-slate-900">
                {{ selection?.flopLabel || recordValue.flop.label }}
              </h1>
              <div class="mt-2 text-sm text-slate-500">
                {{ selection?.presetLabel }}
              </div>
              <div class="mt-2 text-sm text-slate-600">
                Board {{ boardText }}
              </div>
            </div>
            <div class="flex flex-wrap gap-3">
              <button class="button-base button-green" @click="backToResearch">
                Back To Research
              </button>
            </div>
          </div>
        </section>

        <section v-if="recordValue.error" class="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div class="text-sm font-semibold text-red-700">{{ recordValue.error }}</div>
        </section>

        <template v-else-if="recordValue.outcome">
          <section class="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 class="text-xl font-bold text-slate-900">Overview</h2>
              <div class="mt-5 grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl bg-slate-50 px-4 py-4">
                  <div class="text-xs uppercase tracking-[0.18em] text-slate-400">Exploitability</div>
                  <div class="mt-1 text-2xl font-black text-slate-900">{{ formatAdaptive(recordValue.outcome.exploitability) }}</div>
                </div>
                <div class="rounded-2xl bg-slate-50 px-4 py-4">
                  <div class="text-xs uppercase tracking-[0.18em] text-slate-400">Time</div>
                  <div class="mt-1 text-2xl font-black text-slate-900">{{ formatMs(recordValue.outcome.elapsedTimeMs) }}</div>
                </div>
                <div class="rounded-2xl bg-slate-50 px-4 py-4">
                  <div class="text-xs uppercase tracking-[0.18em] text-slate-400">Iteration</div>
                  <div class="mt-1 text-2xl font-black text-slate-900">{{ recordValue.outcome.currentIteration }}</div>
                </div>
                <div class="rounded-2xl bg-slate-50 px-4 py-4">
                  <div class="text-xs uppercase tracking-[0.18em] text-slate-400">Compression</div>
                  <div class="mt-1 text-2xl font-black text-slate-900">{{ recordValue.outcome.compressionEnabled ? 'On' : 'Off' }}</div>
                </div>
              </div>

              <div class="mt-5 grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl border border-slate-200 px-4 py-4">
                  <div class="text-xs uppercase tracking-[0.18em] text-slate-400">Equity OOP</div>
                  <div class="mt-1 text-lg font-bold text-slate-900">{{ formatPercent(recordValue.outcome.rootSummary.equity[0]) }}</div>
                </div>
                <div class="rounded-2xl border border-slate-200 px-4 py-4">
                  <div class="text-xs uppercase tracking-[0.18em] text-slate-400">Equity IP</div>
                  <div class="mt-1 text-lg font-bold text-slate-900">{{ formatPercent(recordValue.outcome.rootSummary.equity[1]) }}</div>
                </div>
                <div class="rounded-2xl border border-slate-200 px-4 py-4">
                  <div class="text-xs uppercase tracking-[0.18em] text-slate-400">EV OOP</div>
                  <div class="mt-1 text-lg font-bold text-slate-900">{{ formatAdaptive(recordValue.outcome.rootSummary.ev[0]) }}</div>
                </div>
                <div class="rounded-2xl border border-slate-200 px-4 py-4">
                  <div class="text-xs uppercase tracking-[0.18em] text-slate-400">EV IP</div>
                  <div class="mt-1 text-lg font-bold text-slate-900">{{ formatAdaptive(recordValue.outcome.rootSummary.ev[1]) }}</div>
                </div>
              </div>
            </div>

            <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 class="text-xl font-bold text-slate-900">Root Actions</h2>
              <div class="mt-5 space-y-3">
                <div
                  v-for="action in recordValue.outcome.rootSummary.actions"
                  :key="action.label"
                  class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <div class="text-base font-bold text-slate-900">{{ action.label }}</div>
                      <div class="text-sm text-slate-500">EV {{ action.ev === null ? '-' : formatAdaptive(action.ev) }}</div>
                    </div>
                    <div class="text-right text-2xl font-black text-slate-900">
                      {{ formatPercent(action.frequency) }}
                    </div>
                  </div>
                  <div class="mt-3 h-2.5 rounded-full bg-slate-200">
                    <div
                      class="h-2.5 rounded-full bg-[linear-gradient(90deg,_#1d4ed8_0%,_#38bdf8_100%)]"
                      :style="{ width: `${Math.max(2, action.frequency * 100)}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-xl font-bold text-slate-900">Tree Preview</h2>
            <p class="mt-1 text-sm text-slate-600">
              Preview persisté pour ce flop uniquement. Il provient du batch et n'exige pas de recalcul.
            </p>
            <div v-if="recordValue.outcome.rootSummary.treePreview" class="mt-5">
              <ResearchTreePreview :node="recordValue.outcome.rootSummary.treePreview" />
            </div>
            <div v-else class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              No persisted tree preview available for this flop.
            </div>
          </section>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { getResearchRun } from "../db";
import { useStore } from "../store";
import type { FlopStudyItem } from "../lib/research-presets";
import type { SolveOutcome } from "../lib/research-solver";
import { toFixedAdaptive } from "../utils";
import ResearchTreePreview from "./ResearchTreePreview.vue";

type PersistedResearchValue = {
  flop: FlopStudyItem;
  board: number[];
  outcome: SolveOutcome | null;
  error: string | null;
};

const formatPercent = (value: number) => {
  if (!isFinite(value)) return "-";
  return `${(value * 100).toFixed(1)}%`;
};

const formatAdaptive = (value: number) => {
  if (!isFinite(value)) return "-";
  return toFixedAdaptive(value);
};

const formatMs = (value: number) => `${(value / 1000).toFixed(2)}s`;

export default defineComponent({
  components: {
    ResearchTreePreview,
  },
  setup() {
    const store = useStore();
    const isLoading = ref(false);
    const loadError = ref("");
    const recordValue = ref<PersistedResearchValue | null>(null);

    const selection = computed(() => store.selectedResearchResult);
    const boardText = computed(
      () => recordValue.value?.outcome?.rootSummary.boardText || selection.value?.boardText || "-"
    );

    const loadRecord = async () => {
      if (!selection.value) {
        recordValue.value = null;
        loadError.value = "No research flop selected.";
        return;
      }

      isLoading.value = true;
      loadError.value = "";

      try {
        const record = await getResearchRun(
          selection.value.situationKey,
          selection.value.flopKey
        );

        if (!record) {
          recordValue.value = null;
          loadError.value = "Persisted flop result not found.";
          return;
        }

        recordValue.value = record.value as PersistedResearchValue;
      } catch (error) {
        recordValue.value = null;
        loadError.value = error instanceof Error ? error.message : String(error);
      } finally {
        isLoading.value = false;
      }
    };

    const backToResearch = () => {
      store.navView = "research";
    };

    watch(selection, loadRecord, { immediate: true });

    return {
      selection,
      isLoading,
      loadError,
      recordValue,
      boardText,
      formatPercent,
      formatAdaptive,
      formatMs,
      backToResearch,
    };
  },
});
</script>
