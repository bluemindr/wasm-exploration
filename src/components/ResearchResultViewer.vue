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
            <button class="button-base button-blue" @click="openInNewTab">
              Open In New Tab
            </button>
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
                {{
                  persistedValue.serializedGame
                    ? "Le tree sérialisé est disponible et peut être rouvert sans recalcul."
                    : "Aucun tree sérialisé disponible pour ce run. Le résumé persistant reste consultable sans recalcul."
                }}
              </div>
            </div>
            <div class="flex flex-wrap gap-3">
              <button
                class="button-base button-blue"
                :disabled="isOpeningNative || !persistedValue.serializedGame"
                @click="openNativeResults"
              >
                {{ isOpeningNative ? "Opening Native Results..." : "Open Persisted Native Results" }}
              </button>
              <button
                v-if="!persistedValue.serializedGame"
                class="button-base button-red"
                :disabled="isOpeningNative"
                @click="rebuildNativeResults"
              >
                {{ isOpeningNative ? "Rebuilding Native Results..." : "Rebuild Native Results" }}
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

          <div class="mt-5 grid gap-4 lg:grid-cols-2">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">OOP flop</div>
              <div class="mt-3 space-y-3">
                <div
                  v-for="action in getFlopPlayerSummary('oop').actions"
                  :key="`oop-${action.label}`"
                  class="rounded-2xl border border-slate-200 bg-white px-4 py-4"
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
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">IP flop</div>
              <div class="mt-1 text-xs text-slate-500">{{ getFlopPlayerSummary('ip').contextLabel || 'After OOP check' }}</div>
              <div class="mt-3 space-y-3">
                <div
                  v-for="action in getFlopPlayerSummary('ip').actions"
                  :key="`ip-${action.label}`"
                  class="rounded-2xl border border-slate-200 bg-white px-4 py-4"
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
                      class="h-2.5 rounded-full bg-[linear-gradient(90deg,_#92400e_0%,_#f59e0b_100%)]"
                      :style="{ width: `${Math.max(2, action.frequency * 100)}%` }"
                    ></div>
                  </div>
                </div>
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
import {
  buildResearchResultUrl,
  clearResearchResultSelection,
  useConfigStore,
  useSavedConfigStore,
  useStore,
} from "../store";
import {
  createResearchPresetSnapshot,
  type FlopStudyItem,
  type ResearchPresetId,
} from "../lib/research-presets";
import {
  exportSolvedGame,
  loadSerializedGame,
  replaySolvedResult,
  type FlopPlayerSummary,
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

const emptyFlopPlayerSummary = (player: "oop" | "ip"): FlopPlayerSummary => ({
  player,
  actions: [],
  contextLabel: player === "ip" ? "After OOP check" : null,
});

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

    const getFlopPlayerSummary = (player: "oop" | "ip"): FlopPlayerSummary => {
      const summary = persistedValue.value?.outcome?.rootSummary.flopPlayerSummaries?.[player];
      if (summary) {
        return summary;
      }

      if (player === "oop") {
        return {
          player: "oop",
          actions: persistedValue.value?.outcome?.rootSummary.actions || [],
          contextLabel: null,
        };
      }

      return emptyFlopPlayerSummary("ip");
    };

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
        progressText.value = value.serializedGame
          ? "Saved result tree is ready to open."
          : "Persisted summary loaded. Open the native interface only if needed.";
      } catch (error) {
        loadError.value = error instanceof Error ? error.message : String(error);
      } finally {
        isLoading.value = false;
      }
    };

    const openNativeResults = async (
      existingRecord = null as Awaited<ReturnType<typeof getResearchRun>> | null,
      existingValue = persistedValue.value,
      existingSnapshot = persistedSnapshot.value,
      allowReplay = false
    ) => {
      if (!existingValue?.outcome || !existingSnapshot) {
        loadError.value = "Persisted flop result is not ready.";
        return;
      }

      if (!existingValue.serializedGame && !allowReplay) {
        loadError.value =
          "No serialized tree is stored for this run. Use the explicit rebuild action only if you want to recompute the native interface.";
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
        } else if (allowReplay) {
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
        clearResearchResultSelection(store, "results", false);
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

    const rebuildNativeResults = async () => {
      await openNativeResults(null, persistedValue.value, persistedSnapshot.value, true);
    };

    const backToResearch = () => {
      clearResearchResultSelection(store, "research");
    };

    const openInNewTab = () => {
      if (!selection.value) {
        return;
      }

      window.open(buildResearchResultUrl(selection.value), "_blank", "noopener");
    };

    watch(selection, loadRecord, { immediate: true });

    return {
      selection,
      isLoading,
      isOpeningNative,
      loadError,
      progressText,
      persistedValue,
      getFlopPlayerSummary,
      openNativeResults,
      rebuildNativeResults,
      formatAdaptive,
      formatPercent,
      backToResearch,
      openInNewTab,
    };
  },
});
</script>
