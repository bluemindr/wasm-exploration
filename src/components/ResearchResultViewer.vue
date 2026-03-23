<template>
  <div class="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_26%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
    <div class="mx-auto max-w-screen-lg px-6 py-6">
      <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
              Research Result
            </div>
            <h1 class="mt-2 text-4xl font-black tracking-tight text-slate-900">
              {{ selection?.flopLabel || "Flop result" }}
            </h1>
            <div class="mt-2 text-sm text-slate-500">
              {{ selection?.presetLabel }}
            </div>
            <div class="mt-2 text-sm text-slate-600">
              Board {{ selection?.boardText || "-" }}
            </div>
          </div>
          <div class="flex flex-wrap gap-3">
            <button class="button-base button-green" @click="backToResearch">
              Back To Research
            </button>
          </div>
        </div>
      </section>

      <section
        v-if="isLoading || isOpeningNative"
        class="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div class="flex items-center gap-3 text-slate-700">
          <span class="spinner inline-block"></span>
          <span class="text-sm font-semibold">Loading native Results interface...</span>
        </div>
        <div class="mt-4 text-sm text-slate-600">
          {{ progressText }}
        </div>
      </section>

      <section
        v-else-if="loadError"
        class="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm"
      >
        <div class="text-sm font-semibold text-red-700">{{ loadError }}</div>
      </section>

      <template v-else-if="persistedValue && persistedValue.outcome">
        <section class="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div class="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                Persisted Summary
              </div>
              <div class="mt-2 text-sm text-slate-600">
                Ce run n'a pas encore d'arbre complet sérialisé. L'ouverture native utilise donc le
                fallback de compatibilité.
              </div>
            </div>
            <div class="flex flex-wrap gap-3">
              <button
                class="button-base button-blue"
                :disabled="isOpeningNative"
                @click="openNativeResults"
              >
                {{ isOpeningNative ? "Opening Native Results..." : "Open Native Results Interface" }}
              </button>
            </div>
          </div>

          <div class="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div class="rounded-2xl bg-slate-50 px-4 py-3">
              <div class="text-xs uppercase tracking-[0.18em] text-slate-400">Exploitability</div>
              <div class="mt-1 text-lg font-bold text-slate-900">
                {{ formatAdaptive(persistedValue.outcome.exploitability) }}
              </div>
            </div>
            <div class="rounded-2xl bg-slate-50 px-4 py-3">
              <div class="text-xs uppercase tracking-[0.18em] text-slate-400">Iterations</div>
              <div class="mt-1 text-lg font-bold text-slate-900">
                {{ persistedValue.outcome.currentIteration }}
              </div>
            </div>
            <div class="rounded-2xl bg-slate-50 px-4 py-3">
              <div class="text-xs uppercase tracking-[0.18em] text-slate-400">Equity OOP</div>
              <div class="mt-1 text-lg font-bold text-slate-900">
                {{ formatPercent(persistedValue.outcome.rootSummary.equity[0]) }}
              </div>
            </div>
            <div class="rounded-2xl bg-slate-50 px-4 py-3">
              <div class="text-xs uppercase tracking-[0.18em] text-slate-400">EV OOP</div>
              <div class="mt-1 text-lg font-bold text-slate-900">
                {{ formatAdaptive(persistedValue.outcome.rootSummary.ev[0]) }}
              </div>
            </div>
          </div>

          <div class="mt-5 grid gap-3 lg:grid-cols-3">
            <div
              v-for="action in persistedValue.outcome.rootSummary.actions"
              :key="action.label"
              class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-base font-bold text-slate-900">
                    {{ action.label }}
                  </div>
                  <div class="text-sm text-slate-500">
                    EV {{ action.ev === null ? '-' : formatAdaptive(action.ev) }}
                  </div>
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
        </section>

        <section
          v-if="persistedValue.outcome.rootSummary.treePreview"
          class="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div class="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
            Persisted Tree Preview
          </div>
          <div class="mt-4">
            <ResearchTreePreview :node="persistedValue.outcome.rootSummary.treePreview" />
          </div>
        </section>

      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import ResearchTreePreview from "./ResearchTreePreview.vue";
import { getResearchRun, putResearchRun } from "../db";
import { useConfigStore, useSavedConfigStore, useStore } from "../store";
import {
  createResearchPresetSnapshot,
  type FlopStudyItem,
  type ResearchPresetId,
} from "../lib/research-presets";
import {
  exportSolvedGame,
  loadSerializedGame,
  replaySolvedResult,
  type SolveOutcome,
  type SolverConfigSnapshot,
} from "../lib/research-solver";

type PersistedResearchValue = {
  flop: FlopStudyItem;
  board: number[];
  snapshot?: SolverConfigSnapshot;
  serializedGame?: ArrayBuffer;
  outcome: SolveOutcome | null;
  error: string | null;
};

const resultViewerThreads =
  typeof SharedArrayBuffer !== "undefined" && window.crossOriginIsolated === true
    ? Math.max(1, Math.min(3, navigator.hardwareConcurrency || 1))
    : 1;

const formatPercent = (value: number) => {
  if (!isFinite(value)) return "-";
  return `${(value * 100).toFixed(1)}%`;
};

const formatAdaptive = (value: number) => {
  if (!isFinite(value)) return "-";
  const absValue = Math.abs(value);
  if (absValue >= 100) return value.toFixed(1);
  if (absValue >= 10) return value.toFixed(2);
  if (absValue >= 1) return value.toFixed(3);
  return value.toFixed(4);
};

const toUint8Array = (value: ArrayBuffer | Uint8Array) =>
  value instanceof Uint8Array ? value : new Uint8Array(value);

const applySnapshotToStore = (
  target: ReturnType<typeof useConfigStore> | ReturnType<typeof useSavedConfigStore>,
  snapshot: SolverConfigSnapshot
) => {
  target.rangeRaw[0].set(snapshot.rangeRaw[0]);
  target.rangeRaw[1].set(snapshot.rangeRaw[1]);
  target.$patch({
    board: [...snapshot.board],
    startingPot: snapshot.startingPot,
    effectiveStack: snapshot.effectiveStack,
    rakePercent: snapshot.rakePercent,
    rakeCap: snapshot.rakeCap,
    donkOption: snapshot.donkOption,
    oopFlopBet: snapshot.oopFlopBet,
    oopFlopRaise: snapshot.oopFlopRaise,
    oopTurnBet: snapshot.oopTurnBet,
    oopTurnRaise: snapshot.oopTurnRaise,
    oopTurnDonk: snapshot.oopTurnDonk,
    oopRiverBet: snapshot.oopRiverBet,
    oopRiverRaise: snapshot.oopRiverRaise,
    oopRiverDonk: snapshot.oopRiverDonk,
    ipFlopBet: snapshot.ipFlopBet,
    ipFlopRaise: snapshot.ipFlopRaise,
    ipTurnBet: snapshot.ipTurnBet,
    ipTurnRaise: snapshot.ipTurnRaise,
    ipRiverBet: snapshot.ipRiverBet,
    ipRiverRaise: snapshot.ipRiverRaise,
    addAllInThreshold: snapshot.addAllInThreshold,
    forceAllInThreshold: snapshot.forceAllInThreshold,
    mergingThreshold: snapshot.mergingThreshold,
    addedLines: snapshot.addedLines,
    removedLines: snapshot.removedLines,
  });
};

export default defineComponent({
  components: {
    ResearchTreePreview,
  },
  setup() {
    const store = useStore();
    const config = useConfigStore();
    const savedConfig = useSavedConfigStore();
    const isLoading = ref(false);
    const isOpeningNative = ref(false);
    const loadError = ref("");
    const progressText = ref("Loading persisted flop result...");
    const persistedValue = ref<PersistedResearchValue | null>(null);
    const persistedSnapshot = ref<SolverConfigSnapshot | null>(null);

    const selection = computed(() => store.selectedResearchResult);

    const loadRecord = async () => {
      if (!selection.value) {
        loadError.value = "No research flop selected.";
        return;
      }

        isLoading.value = true;
        isOpeningNative.value = false;
      loadError.value = "";
        persistedValue.value = null;
        persistedSnapshot.value = null;
        progressText.value = "Fetching persisted research result...";

      try {
        const record = await getResearchRun(
          selection.value.situationKey,
          selection.value.flopKey
        );

        if (!record) {
          loadError.value = "Persisted flop result not found.";
          return;
        }

        const value = record.value as PersistedResearchValue;
        if (value.error || !value.outcome) {
          loadError.value = value.error || "This flop does not have a solved result.";
          return;
        }

        const snapshot =
          value.snapshot ||
          createResearchPresetSnapshot(
            record.presetId as ResearchPresetId,
            value.board,
            value.flop.flopBetOverride
              ? {
                  oopFlopBet: value.flop.flopBetOverride,
                  ipFlopBet: value.flop.flopBetOverride,
                }
              : undefined
          );

        persistedValue.value = value;
        persistedSnapshot.value = snapshot;
        await openNativeResults(record, value, snapshot);
      } catch (error) {
        loadError.value = error instanceof Error ? error.message : String(error);
      } finally {
        isLoading.value = false;
      }
    };

    const openNativeResults = async (
      existingRecord = null as Awaited<ReturnType<typeof getResearchRun>> | null,
      existingValue = persistedValue.value,
      existingSnapshot = persistedSnapshot.value
    ) => {
      if (!existingValue?.outcome || !existingSnapshot) {
        loadError.value = "Persisted flop result is not ready.";
        return;
      }

      isOpeningNative.value = true;
      loadError.value = "";
      progressText.value = existingValue.serializedGame
        ? "Loading saved result tree..."
        : "Rebuilding tree for the live Results interface...";

      try {
        store.isSolverRunning = true;
        store.isFinalizing = false;
        store.isSolverPaused = false;
        store.isSolverFinished = false;

        if (existingValue.serializedGame) {
          await loadSerializedGame(
            toUint8Array(existingValue.serializedGame),
            resultViewerThreads
          );
          progressText.value = "Opening native Results interface...";
        } else {
          await replaySolvedResult(
            existingSnapshot,
            {
              currentIteration: existingValue.outcome.currentIteration,
              compressionEnabled: existingValue.outcome.compressionEnabled,
            },
            resultViewerThreads,
            (progress) => {
              if (progress.stage === "building") {
                progressText.value = "Rebuilding tree for the live Results interface...";
                return;
              }

              if (progress.stage === "allocating") {
                progressText.value = "Allocating solver memory...";
                return;
              }

              if (progress.stage === "iterating") {
                progressText.value = `Replaying solve iterations ${progress.currentIteration}/${progress.totalIterations}...`;
                return;
              }

              if (progress.stage === "finalizing") {
                progressText.value = "Finalizing live result tree...";
                return;
              }

              progressText.value = "Opening native Results interface...";
            }
          );

          if (existingRecord) {
            try {
              const serializedGame = await exportSolvedGame();
              const nextValue = {
                ...existingValue,
                snapshot: existingSnapshot,
                serializedGame,
              } satisfies PersistedResearchValue;
              await putResearchRun({
                ...existingRecord,
                updatedAt: Date.now(),
                value: nextValue,
              });
              persistedValue.value = nextValue;
            } catch (error) {
              console.warn("Failed to backfill serialized solver tree", error);
            }
          }
        }

        applySnapshotToStore(config, existingSnapshot);
        applySnapshotToStore(savedConfig, existingSnapshot);

        store.isSolverRunning = false;
        store.isFinalizing = false;
        store.isSolverPaused = false;
        store.isSolverFinished = true;
        store.selectedResearchResult = null;
        store.navView = "results";
      } catch (error) {
        store.isSolverRunning = false;
        store.isFinalizing = false;
        store.isSolverPaused = false;
        store.isSolverFinished = false;
        loadError.value = error instanceof Error ? error.message : String(error);
      } finally {
        isOpeningNative.value = false;
      }
    };

    const backToResearch = () => {
      store.navView = "research";
    };

    watch(selection, loadRecord, { immediate: true });

    return {
      selection,
      isLoading,
      isOpeningNative,
      loadError,
      progressText,
      persistedValue,
      openNativeResults,
      formatAdaptive,
      formatPercent,
      backToResearch,
    };
  },
});
</script>
