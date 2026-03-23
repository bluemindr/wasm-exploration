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
        v-if="isLoading"
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
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { getResearchRun } from "../db";
import { useConfigStore, useSavedConfigStore, useStore } from "../store";
import {
  createResearchPresetSnapshot,
  type FlopStudyItem,
  type ResearchPresetId,
} from "../lib/research-presets";
import {
  replaySolvedResult,
  type SolveOutcome,
  type SolverConfigSnapshot,
} from "../lib/research-solver";

type PersistedResearchValue = {
  flop: FlopStudyItem;
  board: number[];
  snapshot?: SolverConfigSnapshot;
  outcome: SolveOutcome | null;
  error: string | null;
};

const resultViewerThreads =
  typeof SharedArrayBuffer !== "undefined" && window.crossOriginIsolated === true
    ? Math.max(1, Math.min(3, navigator.hardwareConcurrency || 1))
    : 1;

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
  setup() {
    const store = useStore();
    const config = useConfigStore();
    const savedConfig = useSavedConfigStore();
    const isLoading = ref(false);
    const loadError = ref("");
    const progressText = ref("Loading persisted flop result...");

    const selection = computed(() => store.selectedResearchResult);

    const loadRecord = async () => {
      if (!selection.value) {
        loadError.value = "No research flop selected.";
        return;
      }

      isLoading.value = true;
      loadError.value = "";
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

        progressText.value = "Rebuilding tree for the live Results interface...";
        store.isSolverRunning = true;
        store.isFinalizing = false;
        store.isSolverPaused = false;
        store.isSolverFinished = false;

        await replaySolvedResult(
          snapshot,
          {
            currentIteration: value.outcome.currentIteration,
            compressionEnabled: value.outcome.compressionEnabled,
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

        applySnapshotToStore(config, snapshot);
        applySnapshotToStore(savedConfig, snapshot);

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
      progressText,
      backToResearch,
    };
  },
});
</script>
