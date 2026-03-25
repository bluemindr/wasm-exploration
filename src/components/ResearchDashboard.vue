<template>
  <div class="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(251,191,36,0.18),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
    <div class="mx-auto max-w-screen-xl px-6 py-6">
      <section class="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <div class="flex flex-wrap items-start justify-between gap-6">
          <div class="max-w-3xl">
            <div class="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
              Multi-Flop Research
            </div>
            <h1 class="mt-2 text-4xl font-black tracking-tight text-slate-900">
              Batch solver + heuristics dashboard
            </h1>
            <p class="mt-3 max-w-2xl text-sm text-slate-600">
              Lance une étude sur un sous-ensemble représentatif de flops, avec
              overbet 2x pot activé sur les boards les plus favorables comme
              AK3r et K83r, puis exporte un prompt détaillé pour demander à un
              LLM d'en déduire des heuristiques exploitables humainement.
            </p>
          </div>

          <div class="grid min-w-[17rem] gap-3 rounded-2xl border border-slate-200 bg-slate-950 px-5 py-4 text-slate-50 shadow-xl">
            <div class="text-xs uppercase tracking-[0.22em] text-sky-300">
              Current research rules
            </div>
            <div class="text-sm leading-6 text-slate-200">
              SRP flop OR: 50%, 200%
              <br />
              SRP flop BB lead: 33%
              <br />
              SRP turn caller: 50%, 200%
              <br />
              SRP turn OR: 50%, 100%, 200%
              <br />
              River: 50%
              <br />
              SRP batch precision: forced 16-bit
              <br />
              Raises: 70% or all-in
            </div>
          </div>
        </div>
      </section>

      <section class="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-bold text-slate-900">Typical presets</h2>
              <p class="mt-1 text-sm text-slate-600">
                Charge une base standard, puis affine les ranges via l'éditeur
                natif de l'application si besoin.
              </p>
            </div>
            <button
              class="button-base button-blue"
              :disabled="isRunning"
              @click="loadSelectedPreset"
            >
              Load In Solver
            </button>
          </div>

          <div class="mt-5 grid gap-4 lg:grid-cols-2">
            <button
              v-for="preset in presets"
              :key="preset.id"
              :class="presetCardClass(preset.id)"
              :disabled="isRunning"
              @click="selectedPresetId = preset.id"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-left text-lg font-bold text-slate-900">
                    {{ preset.label }}
                  </div>
                  <div class="mt-1 text-left text-sm text-slate-600">
                    {{ preset.summary }}
                  </div>
                </div>
                <div
                  class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]"
                  :class="
                    preset.id === selectedPresetId
                      ? 'bg-sky-900 text-sky-100'
                      : 'bg-slate-100 text-slate-500'
                  "
                >
                  {{ preset.rakePercent }}% rake
                </div>
              </div>
              <div class="mt-4 grid grid-cols-3 gap-3 text-left text-sm text-slate-700">
                <div>
                  <div class="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Pot
                  </div>
                  <div class="mt-1 font-semibold">{{ preset.startingPot }}</div>
                </div>
                <div>
                  <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Stack</div>
                  <div class="mt-1 font-semibold">{{ preset.effectiveStack }}</div>
                </div>
                <div>
                  <div class="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Turn sizes
                  </div>
                  <div class="mt-1 font-semibold">{{ preset.ipTurnBet }}</div>
                </div>
              </div>
              <div class="mt-4 text-left text-sm text-slate-500">
                {{ preset.note }}
              </div>
            </button>
          </div>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold text-slate-900">Run controls</h2>
          <p class="mt-1 text-sm text-slate-600">
            La recherche se base sur la config actuellement chargée dans
            l'éditeur solver.
          </p>
          <p v-if="!supportsSharedThreads" class="mt-2 text-sm text-amber-700">
            Multi-thread WASM indisponible dans ce contexte navigateur. La recherche utilise 1 thread.
          </p>
          <p v-if="workerRuntimeText" class="mt-2 text-sm" :class="workerRuntimeClass">
            {{ workerRuntimeText }}
          </p>
          <p v-if="researchInitError" class="mt-2 text-sm font-semibold text-red-700">
            {{ researchInitError }}
          </p>

          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <label class="text-sm font-semibold text-slate-700">
              Threads
              <input
                v-model="numThreads"
                type="number"
                min="1"
                max="64"
                :disabled="isRunning"
                class="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label class="text-sm font-semibold text-slate-700">
              Target exploitability %
              <input
                v-model="targetExploitability"
                type="number"
                min="0.05"
                step="0.05"
                :disabled="isRunning"
                class="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label class="text-sm font-semibold text-slate-700">
              Max iterations
              <input
                v-model="maxIterations"
                type="number"
                min="1"
                :disabled="isRunning"
                class="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label class="text-sm font-semibold text-slate-700">
              Tree preview depth
              <input
                v-model="treeDepth"
                type="number"
                min="1"
                max="3"
                :disabled="isRunning"
                class="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label class="mt-5 block text-sm font-semibold text-slate-700">
            Custom flops
            <textarea
              v-model="customBoardsText"
              rows="4"
              :disabled="isRunning"
              class="mt-1.5 w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
              placeholder="One flop per line, e.g.&#10;AcKd3h&#10;Kh8d3c"
            ></textarea>
          </label>

          <div v-if="invalidCustomBoards.length > 0" class="mt-2 text-sm font-semibold text-red-600">
            Invalid custom flops: {{ invalidCustomBoards.join(", ") }}
          </div>

          <div class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div class="flex items-center justify-between gap-4">
              <div>
                <div class="text-sm font-semibold text-slate-900">Effective flop list</div>
                <div class="mt-1 text-xs text-slate-500">
                  Liste exacte qui sera lancée par la batch: sélection représentative du bas + custom flops valides.
                </div>
              </div>
              <div class="text-right text-sm font-semibold text-slate-600">
                {{ selectedRepresentativeFlopCount }} representative
                <br />
                {{ validCustomFlopCount }} custom
              </div>
            </div>

            <textarea
              :value="effectiveFlopListText"
              rows="7"
              readonly
              class="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-800"
            ></textarea>
          </div>

          <label class="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            <input v-model="forceRecalculate" type="checkbox" class="rounded" :disabled="isRunning" />
            Force Recalculate
            <span class="font-normal text-slate-500">
              Ignore le cache persistant de cette situation et relance tous les flops.
            </span>
          </label>

          <div class="mt-5 flex flex-wrap gap-3">
            <button
              class="button-base button-blue"
              :disabled="isRunning || isLoadingCachedResults"
              @click="syncResultsFromCache"
            >
              {{ isLoadingCachedResults ? "Loading Cached Results..." : "Load Cached Results" }}
            </button>
            <button
              class="button-base button-blue"
              :disabled="isRunning || invalidCustomBoards.length > 0"
              @click="runResearch"
            >
              Load Preset And Run Batch
            </button>
            <button
              class="button-base button-red"
              :disabled="!isRunning"
              @click="stopResearch"
            >
              Stop Run
            </button>
            <button class="button-base button-green" :disabled="isRunning" @click="selectAllFlops">
              Select All
            </button>
            <button class="button-base button-red" :disabled="isRunning" @click="clearResults">
              Clear Results
            </button>
            <button
              class="button-base button-red"
              :disabled="isRunning || isDeletingCache || !situationKey"
              @click="deletePresetCache"
            >
              {{ isDeletingCache ? "Deleting Cache..." : "Delete Preset Cache" }}
            </button>
          </div>

          <div class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <div class="font-semibold text-slate-900">{{ progressTitle }}</div>
            <div class="mt-1">{{ progressText }}</div>
            <div class="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
              <div>Selected preset: <span class="font-semibold text-slate-700">{{ selectedPreset.label }}</span></div>
              <div>Running preset: <span class="font-semibold text-slate-700">{{ activeRunPresetLabel || '-' }}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-bold text-slate-900">Representative flops</h2>
            <p class="mt-1 text-sm text-slate-600">
              Sélectionne le noyau d'étude. Les poids servent à agréger les
              résultats et à donner plus d'importance aux textures fréquentes.
            </p>
          </div>
          <div class="text-sm font-semibold text-slate-500">
            {{ selectedFlopIds.length }} selected
          </div>
        </div>

        <div class="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label
            v-for="flop in flops"
            :key="flop.id"
            class="group flex gap-3 rounded-2xl border px-4 py-4 transition-colors"
            :class="
              selectedFlopIds.includes(flop.id)
                ? 'border-sky-300 bg-sky-50'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            "
            :style="isRunning ? 'pointer-events:none; opacity:0.7' : ''"
          >
            <input
              :checked="selectedFlopIds.includes(flop.id)"
              type="checkbox"
              class="mt-1 rounded"
              :disabled="isRunning"
              @change="toggleFlop(flop.id)"
            />
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <div class="text-lg font-black tracking-wide text-slate-900">
                  {{ flop.label }}
                </div>
                <div class="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                  w {{ flop.weight }}
                </div>
              </div>
              <div class="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                {{ flop.category }}
              </div>
              <div class="mt-2 text-sm text-slate-600">
                {{ flop.note }}
              </div>
              <div v-if="flop.flopBetOverride" class="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                Flop override {{ flop.flopBetOverride }}
              </div>
            </div>
          </label>
        </div>
      </section>

      <section
        v-if="isLoadingCachedResults && !isRunning"
        class="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div class="flex items-center gap-3 text-slate-700">
          <span class="spinner inline-block"></span>
          <span class="text-sm font-semibold">Loading persisted research results...</span>
        </div>
        <div class="mt-3 text-sm text-slate-500">
          Fetching cached flops for {{ selectedPreset.label }}.
        </div>
      </section>

      <section v-if="results.length > 0" class="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold text-slate-900">Aggregate flop mix</h2>
          <p class="mt-1 text-sm text-slate-600">
            Fréquences moyennes pondérées du premier spot flop de chaque joueur.
          </p>

          <div class="mt-5 grid gap-5 lg:grid-cols-2">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">OOP flop</div>
              <div class="mt-4 space-y-4">
                <div
                  v-for="item in aggregateFlopSummaries.oop"
                  :key="`oop-${item.label}`"
                  class="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div class="flex items-center justify-between gap-4">
                    <div>
                      <div class="text-lg font-bold text-slate-900">{{ item.label }}</div>
                      <div class="text-sm text-slate-500">{{ item.count }} flops</div>
                    </div>
                    <div class="text-right">
                      <div class="text-2xl font-black text-slate-900">
                        {{ formatPercent(item.frequency) }}
                      </div>
                      <div class="text-sm text-slate-500">
                        avg EV {{ formatAdaptive(item.ev) }}
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 h-3 rounded-full bg-slate-200">
                    <div
                      class="h-3 rounded-full bg-[linear-gradient(90deg,_#0f172a_0%,_#0ea5e9_100%)]"
                      :style="{ width: `${Math.max(2, item.frequency * 100)}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">IP flop</div>
              <div class="mt-1 text-xs text-slate-500">Premier spot IP sur le flop, en pratique après check OOP.</div>
              <div class="mt-4 space-y-4">
                <div
                  v-for="item in aggregateFlopSummaries.ip"
                  :key="`ip-${item.label}`"
                  class="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div class="flex items-center justify-between gap-4">
                    <div>
                      <div class="text-lg font-bold text-slate-900">{{ item.label }}</div>
                      <div class="text-sm text-slate-500">{{ item.count }} flops</div>
                    </div>
                    <div class="text-right">
                      <div class="text-2xl font-black text-slate-900">
                        {{ formatPercent(item.frequency) }}
                      </div>
                      <div class="text-sm text-slate-500">
                        avg EV {{ formatAdaptive(item.ev) }}
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 h-3 rounded-full bg-slate-200">
                    <div
                      class="h-3 rounded-full bg-[linear-gradient(90deg,_#92400e_0%,_#f59e0b_100%)]"
                      :style="{ width: `${Math.max(2, item.frequency * 100)}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-bold text-slate-900">LLM export</h2>
              <p class="mt-1 text-sm text-slate-600">
                Prompt prêt à coller dans un LLM pour demander des heuristiques
                précises et actionnables.
              </p>
            </div>
            <button class="button-base button-blue" @click="copyLlmPrompt">
              Copy Prompt
            </button>
          </div>

          <textarea
            :value="llmPrompt"
            rows="24"
            readonly
            class="mt-5 w-full rounded-2xl border border-slate-300 bg-slate-950 px-4 py-4 font-mono text-xs leading-6 text-slate-100"
          ></textarea>
        </div>
      </section>

      <section v-if="results.length > 0" class="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-xl font-bold text-slate-900">Solved flops</h2>
        <p class="mt-1 text-sm text-slate-600">
          Synthèse flop par flop avec exploitability, action root et métriques
          globales.
        </p>

        <div class="mt-5 space-y-4">
          <div
            v-for="result in results"
            :key="result.key"
            class="rounded-3xl border px-5 py-5"
            :class="result.error ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'"
          >
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div class="flex items-center gap-3">
                  <div class="text-3xl font-black tracking-wide text-slate-900">
                    {{ result.flop.label }}
                  </div>
                  <div class="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    {{ result.flop.category }}
                  </div>
                  <div
                    class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                    :class="result.hasSerializedGame ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
                  >
                    {{ result.hasSerializedGame ? 'Native saved' : 'Summary only' }}
                  </div>
                </div>
                <div class="mt-2 text-sm text-slate-600">
                  {{ result.flop.note }}
                </div>
              </div>

              <div class="grid min-w-[18rem] grid-cols-2 gap-3 text-sm">
                <div class="rounded-2xl bg-slate-50 px-4 py-3">
                  <div class="text-xs uppercase tracking-[0.18em] text-slate-400">Exploitability</div>
                  <div class="mt-1 text-lg font-bold text-slate-900">
                    {{ result.error ? '-' : formatAdaptive(result.outcome!.exploitability) }}
                  </div>
                </div>
                <div class="rounded-2xl bg-slate-50 px-4 py-3">
                  <div class="text-xs uppercase tracking-[0.18em] text-slate-400">Time</div>
                  <div class="mt-1 text-lg font-bold text-slate-900">
                    {{ result.error ? '-' : formatMs(result.outcome!.elapsedTimeMs) }}
                  </div>
                </div>
                <div class="rounded-2xl bg-slate-50 px-4 py-3">
                  <div class="text-xs uppercase tracking-[0.18em] text-slate-400">Equity OOP</div>
                  <div class="mt-1 text-lg font-bold text-slate-900">
                    {{ result.error ? '-' : formatPercent(result.outcome!.rootSummary.equity[0]) }}
                  </div>
                </div>
                <div class="rounded-2xl bg-slate-50 px-4 py-3">
                  <div class="text-xs uppercase tracking-[0.18em] text-slate-400">EV OOP</div>
                  <div class="mt-1 text-lg font-bold text-slate-900">
                    {{ result.error ? '-' : formatAdaptive(result.outcome!.rootSummary.ev[0]) }}
                  </div>
                </div>
              </div>
            </div>

            <div v-if="result.error" class="mt-4 rounded-2xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-700">
              {{ result.error }}
            </div>

            <div v-else class="mt-5 grid gap-4 lg:grid-cols-2">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">OOP flop</div>
                <div class="mt-3 space-y-3">
                  <div
                    v-for="action in getFlopPlayerActions(result, 'oop')"
                    :key="`oop-${result.key}-${action.label}`"
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
                <div class="mt-1 text-xs text-slate-500">{{ getFlopPlayerContext(result, 'ip') }}</div>
                <div class="mt-3 space-y-3">
                  <div
                    v-for="action in getFlopPlayerActions(result, 'ip')"
                    :key="`ip-${result.key}-${action.label}`"
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

            <div v-if="!result.error" class="mt-5 flex flex-wrap justify-end gap-3">
              <button class="button-base button-red" :disabled="isRunning || isDeletingCache" @click="deleteFlopCache(result)">
                Delete Flop Cache
              </button>
              <button class="button-base button-blue" @click="openResultPage(result)">
                Open Result Page
              </button>
            </div>
            <div v-else class="mt-5 flex justify-end">
              <button class="button-base button-red" :disabled="isRunning || isDeletingCache" @click="deleteFlopCache(result)">
                Delete Flop Cache
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { workerInitInfo } from "../global-worker";
import {
  buildResearchResultUrl,
  clearResearchResultSelection,
  useConfigStore,
  useStore,
} from "../store";
import {
  deleteResearchRun,
  deleteResearchRuns,
  getResearchRun,
  getResearchRuns,
  putResearchRun,
  type ResearchRunRecord,
} from "../db";
import {
  applyResearchPreset,
  createResearchPresetSnapshot,
  isSingleRaisedPotResearchPreset,
  parseStudyBoard,
  representativeFlops,
  researchPresets,
  type FlopStudyItem,
  type ResearchPresetId,
} from "../lib/research-presets";
import {
  type BatchSolveResult,
  computeFlopKey,
  computeSituationKey,
  computeSituationKeyFromSnapshot,
  captureConfigSnapshot,
  runBatchSolve,
  type FlopPlayerSummary,
  type FlopTreeOverrides,
  type SolverConfigSnapshot,
  type SolveOutcome,
  type RootActionSummary,
} from "../lib/research-solver";
import { checkConfig } from "../lib/solver-config";
import { toFixedAdaptive } from "../utils";

type BatchResult = {
  key: string;
  situationKey: string;
  flopKey: string;
  presetLabel: string;
  flop: FlopStudyItem;
  board: number[];
  snapshot: SolverConfigSnapshot;
  outcome: SolveOutcome | null;
  error: string | null;
  hasSerializedGame: boolean;
};

type CustomFlopStudyItem = FlopStudyItem & {
  parsedBoard: number[];
};

type ActiveFlopStudyItem = FlopStudyItem | CustomFlopStudyItem;

type PersistedBatchValue = {
  flop: FlopStudyItem;
  board: number[];
  snapshot?: SolverConfigSnapshot;
  serializedGame?: ArrayBuffer | Uint8Array;
  outcome: SolveOutcome | null;
  error: string | null;
};

type AggregateAction = {
  label: string;
  frequency: number;
  ev: number;
  count: number;
};

const emptyFlopPlayerSummary = (player: "oop" | "ip"): FlopPlayerSummary => ({
  player,
  actions: [],
  contextLabel: player === "ip" ? "After OOP check" : null,
});

const formatPercent = (value: number) => {
  if (!isFinite(value)) return "-";
  return `${(value * 100).toFixed(1)}%`;
};

const formatAdaptive = (value: number) => {
  if (!isFinite(value)) return "-";
  return toFixedAdaptive(value);
};

const formatMs = (value: number) => `${(value / 1000).toFixed(2)}s`;

const getSerializedGameByteLength = (
  serializedGame?: ArrayBuffer | Uint8Array
) => {
  if (!serializedGame) {
    return 0;
  }

  return serializedGame.byteLength;
};

const hasSerializedGame = (serializedGame?: ArrayBuffer | Uint8Array) =>
  getSerializedGameByteLength(serializedGame) > 0;

const cloneSerializedGame = (serializedGame: ArrayBuffer | Uint8Array) =>
  serializedGame instanceof Uint8Array
    ? serializedGame.slice()
    : new Uint8Array(serializedGame).slice();

const toPersistedSerializedGame = (
  serializedGame?: ArrayBuffer | Uint8Array
): Uint8Array | undefined => {
  if (!serializedGame) {
    return undefined;
  }

  const cloned = cloneSerializedGame(serializedGame);
  return hasSerializedGame(cloned) ? cloned : undefined;
};

const researchPresetCacheKey = (presetId: ResearchPresetId) =>
  isSingleRaisedPotResearchPreset(presetId) ? `${presetId}:research-16bit` : presetId;

export default defineComponent({
  setup() {
    const appStore = useStore();
    const config = useConfigStore();
    const supportsSharedThreads =
      typeof SharedArrayBuffer !== "undefined" &&
      window.crossOriginIsolated === true;

    const presets = researchPresets;
    const flops = representativeFlops;

    const selectedPresetId = ref<ResearchPresetId>(presets[0].id);
    const selectedFlopIds = ref(flops.map((flop) => flop.id));
    const customBoardsText = ref("");
    const numThreads = ref(
      supportsSharedThreads
        ? Math.max(1, Math.min(3, navigator.hardwareConcurrency || 1))
        : 1
    );
    const targetExploitability = ref(0.3);
    const maxIterations = ref(1000);
    const treeDepth = ref(2);
    const forceRecalculate = ref(false);
    const isRunning = ref(false);
    const isLoadingCachedResults = ref(false);
    const isDeletingCache = ref(false);
    const stopRequested = ref(false);
    const activeRunPresetLabel = ref("");
    const workerRuntimeText = ref("");
    const statusText = ref(
      "Charge un preset, ajuste les ranges si nécessaire, puis lance la batch research."
    );
    const results = ref<BatchResult[]>([]);

    const selectedPreset = computed(
      () => presets.find((preset) => preset.id === selectedPresetId.value) || presets[0]
    );

    const selectedPresetSnapshotState = computed(() => {
      try {
        return {
          snapshot: createResearchPresetSnapshot(selectedPresetId.value),
          error: "",
        };
      } catch (error) {
        return {
          snapshot: null,
          error:
            error instanceof Error
              ? `Failed to prepare preset ${selectedPreset.value.label}: ${error.message}`
              : `Failed to prepare preset ${selectedPreset.value.label}: ${String(error)}`,
        };
      }
    });

    const customFlops = computed<CustomFlopStudyItem[]>(() => {
      return customBoardsText.value
        .split(/\n+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .map((boardText, index) => {
          const board = parseStudyBoard(boardText);
          return {
            id: `custom-${index}-${boardText}`,
            boardText,
            label: boardText.replace(/\s+/g, ""),
            category: "Custom",
            weight: 0.5,
            note: "Custom board added manually for this batch.",
            flopBetOverride: undefined,
            parsedBoard: board,
          };
        });
    });

    const invalidCustomBoards = computed(() => {
      return customFlops.value
        .filter((item) => item.parsedBoard.length !== 3)
        .map((item) => item.boardText);
    });

    const activeFlops = computed<ActiveFlopStudyItem[]>(() => {
      const base = flops.filter((flop) => selectedFlopIds.value.includes(flop.id));
      const custom = customFlops.value.filter((flop) => flop.parsedBoard.length === 3);
      return [...base, ...custom];
    });

    const selectedRepresentativeFlopCount = computed(() => selectedFlopIds.value.length);

    const researchInitError = computed(() => selectedPresetSnapshotState.value.error);

    const situationKey = computed(() => {
      const snapshot = selectedPresetSnapshotState.value.snapshot;
      if (!snapshot) {
        return "";
      }

      return computeSituationKeyFromSnapshot(snapshot, researchPresetCacheKey(selectedPresetId.value), {
        targetExploitabilityPercent: targetExploitability.value,
        maxIterations: maxIterations.value,
        treeDepth: treeDepth.value,
      });
    });

    const validCustomFlopCount = computed(
      () => customFlops.value.filter((flop) => flop.parsedBoard.length === 3).length
    );

    const activeFlopDescriptors = computed(() => {
      return activeFlops.value.map((flop) => {
        const treeOverrides: FlopTreeOverrides | undefined = flop.flopBetOverride
          ? {
              oopFlopBet: flop.flopBetOverride,
              ipFlopBet: flop.flopBetOverride,
            }
          : undefined;

        return {
          flop,
          flopKey: computeFlopKey(flop.boardText, treeOverrides),
        };
      });
    });

    const effectiveFlopListText = computed(() => {
      if (activeFlops.value.length === 0) {
        return "No flop selected yet.";
      }

      return activeFlops.value
        .map((flop, index) => {
          const source = "parsedBoard" in flop ? "custom" : "representative";
          return `${String(index + 1).padStart(2, "0")}. ${flop.boardText} | ${flop.label} | ${source}`;
        })
        .join("\n");
    });

    const getResultFlopPlayerSummary = (
      result: BatchResult,
      player: "oop" | "ip"
    ): FlopPlayerSummary => {
      const summary = result.outcome?.rootSummary.flopPlayerSummaries?.[player];
      if (summary) {
        return summary;
      }

      if (player === "oop") {
        return {
          player: "oop",
          actions: result.outcome?.rootSummary.actions || [],
          contextLabel: null,
        };
      }

      return emptyFlopPlayerSummary("ip");
    };

    const aggregatePlayerActions = (player: "oop" | "ip"): AggregateAction[] => {
      const map = new Map<string, { weightedFrequency: number; weightedEv: number; totalWeight: number; count: number }>();

      for (const result of results.value) {
        if (!result.outcome) continue;

        for (const action of getResultFlopPlayerSummary(result, player).actions) {
          const current = map.get(action.label) || {
            weightedFrequency: 0,
            weightedEv: 0,
            totalWeight: 0,
            count: 0,
          };
          current.weightedFrequency += action.frequency * result.flop.weight;
          current.weightedEv += (action.ev ?? 0) * result.flop.weight;
          current.totalWeight += result.flop.weight;
          current.count += 1;
          map.set(action.label, current);
        }
      }

      return Array.from(map.entries())
        .map(([label, value]) => ({
          label,
          frequency: value.totalWeight > 0 ? value.weightedFrequency / value.totalWeight : 0,
          ev: value.totalWeight > 0 ? value.weightedEv / value.totalWeight : Number.NaN,
          count: value.count,
        }))
        .sort((left, right) => right.frequency - left.frequency);
    };

    const aggregateFlopSummaries = computed(() => {
      return {
        oop: aggregatePlayerActions("oop"),
        ip: aggregatePlayerActions("ip"),
      };
    });

    const llmPrompt = computed(() => {
      const payload = {
        preset: selectedPreset.value.label,
        config: {
          startingPot: config.startingPot,
          effectiveStack: config.effectiveStack,
          rakePercent: config.rakePercent,
          rakeCap: config.rakeCap,
          oopFlopBet: config.oopFlopBet,
          ipFlopBet: config.ipFlopBet,
          oopTurnBet: config.oopTurnBet,
          ipTurnBet: config.ipTurnBet,
          oopRiverBet: config.oopRiverBet,
          ipRiverBet: config.ipRiverBet,
          oopFlopRaise: config.oopFlopRaise,
          ipFlopRaise: config.ipFlopRaise,
          oopTurnRaise: config.oopTurnRaise,
          ipTurnRaise: config.ipTurnRaise,
          oopRiverRaise: config.oopRiverRaise,
          ipRiverRaise: config.ipRiverRaise,
          addAllInThreshold: config.addAllInThreshold,
          forceAllInThreshold: config.forceAllInThreshold,
          mergingThreshold: config.mergingThreshold,
        },
        aggregateActions: aggregateFlopSummaries.value,
        flops: results.value.map((result) => ({
          board: result.flop.boardText,
          category: result.flop.category,
          weight: result.flop.weight,
          note: result.flop.note,
          flopBetOverride: result.flop.flopBetOverride || null,
          error: result.error,
          outcome: result.outcome
            ? {
                exploitability: result.outcome.exploitability,
                elapsedTimeMs: result.outcome.elapsedTimeMs,
                currentIteration: result.outcome.currentIteration,
                rootSummary: result.outcome.rootSummary,
              }
            : null,
        })),
      };

      return [
        "Tu es un coach GTO pragmatique.",
        "Analyse l'ensemble des flops ci-dessous et extrais des heuristiques assez précises pour être utilisables par un humain en jeu.",
        "Je veux des règles concrètes, avec conditions de texture, sizings préférés, exceptions importantes et pièges à éviter.",
        "Concentre-toi sur les décisions au flop puis sur les simplifications turn.",
        "Quand tu proposes une heuristique, appuie-la sur plusieurs flops du dataset et signale les contre-exemples.",
        "Format attendu:",
        "1. Heuristiques flop par familles de boards",
        "2. Heuristiques turn générales",
        "3. Cas où l'overbet flop 2x pot devient crédible",
        "4. Cas où il faut éviter de trop simplifier",
        "5. Résumé exécutable en jeu en 10 points maximum",
        "Dataset JSON:",
        JSON.stringify(payload, null, 2),
      ].join("\n\n");
    });

    const progressTitle = computed(() =>
      isRunning.value
        ? `Batch running${activeRunPresetLabel.value ? `: ${activeRunPresetLabel.value}` : ""}`
        : "Ready"
    );
    const progressText = computed(() => statusText.value);
    const workerRuntimeClass = computed(() =>
      workerRuntimeText.value.includes("fallback") ? "text-amber-700" : "text-slate-600"
    );

    const refreshWorkerRuntimeText = () => {
      workerRuntimeText.value = workerInitInfo
        ? workerInitInfo.usedFallback
          ? `Requested ${workerInitInfo.requestedThreads} threads, running on 1 thread fallback. ${workerInitInfo.reason || ""}`.trim()
          : workerInitInfo.mode === "multi-thread"
          ? `Running on ${workerInitInfo.actualThreads} worker threads.`
          : `Running on 1 thread.`
        : "";
    };

    const loadSelectedPreset = () => {
      if (isRunning.value) {
        statusText.value = "Cannot load a preset into Solver while a batch is running.";
        return;
      }

      try {
        applyResearchPreset(config, selectedPreset.value);
        clearResearchResultSelection(appStore, "solver");
        appStore.sideView = "oop-range";
        statusText.value = `Loaded ${selectedPreset.value.label} into Solver.`;
      } catch (error) {
        statusText.value =
          error instanceof Error
            ? `Failed to load preset: ${error.message}`
            : `Failed to load preset: ${String(error)}`;
      }
    };

    const presetCardClass = (presetId: ResearchPresetId) => {
      return (
        "rounded-3xl border p-5 text-left transition-all " +
        (presetId === selectedPresetId.value
          ? "border-sky-300 bg-[linear-gradient(135deg,_rgba(14,165,233,0.09),_rgba(15,23,42,0.03))] shadow-md"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm")
      );
    };

    const toggleFlop = (flopId: string) => {
      if (selectedFlopIds.value.includes(flopId)) {
        selectedFlopIds.value = selectedFlopIds.value.filter((item) => item !== flopId);
      } else {
        selectedFlopIds.value = [...selectedFlopIds.value, flopId];
      }
    };

    const selectAllFlops = () => {
      selectedFlopIds.value = flops.map((flop) => flop.id);
    };

    const clearResults = () => {
      results.value = [];
      statusText.value = "Results cleared.";
    };

    const deletePresetCache = async () => {
      if (!situationKey.value || isRunning.value || isDeletingCache.value) {
        return;
      }

      isDeletingCache.value = true;
      try {
        const deleted = await deleteResearchRuns(situationKey.value);
        if (!deleted) {
          statusText.value = `Failed to delete cache for ${selectedPreset.value.label}.`;
          return;
        }

        results.value = [];
        statusText.value = `Deleted cached flops for ${selectedPreset.value.label}.`;
      } finally {
        isDeletingCache.value = false;
      }
    };

    const stopResearch = () => {
      if (!isRunning.value) {
        return;
      }

      stopRequested.value = true;
      statusText.value = "Stopping current batch after the current solver step...";
    };

    const toResearchResultSelection = (result: BatchResult) => ({
      situationKey: result.situationKey,
      flopKey: result.flopKey,
      presetLabel: result.presetLabel,
      boardText: result.flop.boardText,
      flopLabel: result.flop.label,
    });

    const openResultPage = (result: BatchResult) => {
      window.open(buildResearchResultUrl(toResearchResultSelection(result)), "_blank", "noopener");
    };

    const toBatchResult = (
      scenarioKey: string,
      descriptor: (typeof activeFlopDescriptors.value)[number],
      record: ResearchRunRecord
    ): BatchResult => {
      const cachedValue = record.value as PersistedBatchValue;
      const cachedSnapshot =
        cachedValue.snapshot ||
        createResearchPresetSnapshot(
          record.presetId as ResearchPresetId,
          cachedValue.board,
          cachedValue.flop.flopBetOverride
            ? {
                oopFlopBet: cachedValue.flop.flopBetOverride,
                ipFlopBet: cachedValue.flop.flopBetOverride,
              }
            : undefined
        );

      return {
        key: `${scenarioKey}-${descriptor.flopKey}`,
        situationKey: scenarioKey,
        flopKey: descriptor.flopKey,
        presetLabel: record.presetLabel,
        flop: descriptor.flop,
        board: cachedValue.board,
        snapshot: cachedSnapshot,
        outcome: cachedValue.outcome,
        error: cachedValue.error,
        hasSerializedGame: hasSerializedGame(cachedValue.serializedGame),
      };
    };

    const deleteFlopCache = async (result: BatchResult) => {
      if (isRunning.value || isDeletingCache.value) {
        return;
      }

      isDeletingCache.value = true;
      try {
        const deleted = await deleteResearchRun(result.situationKey, result.flopKey);
        if (!deleted) {
          statusText.value = `Failed to delete cached flop ${result.flop.label}.`;
          return;
        }

        results.value = results.value.filter((item) => item.key !== result.key);
        statusText.value = `Deleted cached flop ${result.flop.label}.`;
      } finally {
        isDeletingCache.value = false;
      }
    };

    const syncResultsFromCache = async () => {
      if (isRunning.value) {
        return;
      }

      isLoadingCachedResults.value = true;

      if (!situationKey.value) {
        results.value = [];
        if (researchInitError.value) {
          statusText.value = researchInitError.value;
        } else {
          statusText.value = "No cached results are available for the current preset selection yet.";
        }
        isLoadingCachedResults.value = false;
        return;
      }

      try {
        const cachedRuns = await getResearchRuns(situationKey.value);
        const cachedMap = new Map<string, ResearchRunRecord>(
          cachedRuns.map((record) => [record.flopKey, record])
        );

        results.value = activeFlopDescriptors.value.flatMap((descriptor) => {
          const record = cachedMap.get(descriptor.flopKey);
          return record ? [toBatchResult(situationKey.value, descriptor, record)] : [];
        });
      } catch (error) {
        results.value = [];
        statusText.value =
          error instanceof Error
            ? `Failed to load cached research results: ${error.message}`
            : `Failed to load cached research results: ${String(error)}`;
      } finally {
        isLoadingCachedResults.value = false;
      }
    };

    const upsertResult = (result: BatchResult) => {
      const index = results.value.findIndex((item) => item.key === result.key);
      if (index === -1) {
        results.value = [...results.value, result];
        return;
      }

      const next = [...results.value];
      next[index] = result;
      results.value = next;
    };

    const getSituationKey = () => situationKey.value;

    const copyLlmPrompt = async () => {
      await navigator.clipboard.writeText(llmPrompt.value);
      statusText.value = "LLM prompt copied to clipboard.";
    };

    const normalizeActions = (actions: RootActionSummary[]) => {
      return actions.sort((left, right) => right.frequency - left.frequency);
    };

    const getFlopPlayerActions = (
      result: BatchResult,
      player: "oop" | "ip"
    ) => getResultFlopPlayerSummary(result, player).actions;

    const getFlopPlayerContext = (
      result: BatchResult,
      player: "oop" | "ip"
    ) => getResultFlopPlayerSummary(result, player).contextLabel || "First flop decision";

    const runResearch = async () => {
      if (isRunning.value) {
        return;
      }

      if (activeFlops.value.length === 0) {
        statusText.value = "Select at least one representative flop.";
        return;
      }

      const runPreset = selectedPreset.value;
      const runFlops = [...activeFlops.value];
      const runNumThreads = numThreads.value;
      const runTargetExploitability = targetExploitability.value;
      const runMaxIterations = maxIterations.value;
      const runTreeDepth = treeDepth.value;
      const runForceRecalculate = forceRecalculate.value;

      try {
        applyResearchPreset(config, runPreset);
        clearResearchResultSelection(appStore, "solver");
      } catch (error) {
        statusText.value =
          error instanceof Error
            ? `Failed to load preset before batch: ${error.message}`
            : `Failed to load preset before batch: ${String(error)}`;
        return;
      }

      const validationBoard =
        "parsedBoard" in runFlops[0]
          ? runFlops[0].parsedBoard
          : parseStudyBoard(runFlops[0].boardText);
      const configError = checkConfig(config, { boardOverride: validationBoard });
      if (configError) {
        statusText.value = `Current solver config is invalid: ${configError}`;
        return;
      }

      isRunning.value = true;
      stopRequested.value = false;
      activeRunPresetLabel.value = runPreset.label;
      results.value = [];
      workerRuntimeText.value = "";
      statusText.value = `Loaded ${runPreset.label} into Solver. Starting batch...`;

      const cachePresetId = researchPresetCacheKey(runPreset.id);
      const situationKey = computeSituationKey(config, cachePresetId, {
        targetExploitabilityPercent: runTargetExploitability,
        maxIterations: runMaxIterations,
        treeDepth: runTreeDepth,
      });
      const cachedRuns = runForceRecalculate
        ? []
        : await getResearchRuns(situationKey);
      const cachedMap = new Map<string, ResearchRunRecord>(
        cachedRuns.map((record) => [record.flopKey, record])
      );

      for (const [index, flop] of runFlops.entries()) {
        if (stopRequested.value) {
          break;
        }

        const board: number[] =
          "parsedBoard" in flop ? flop.parsedBoard : parseStudyBoard(flop.boardText);
        const treeOverrides: FlopTreeOverrides | undefined = flop.flopBetOverride
          ? {
              oopFlopBet: flop.flopBetOverride,
              ipFlopBet: flop.flopBetOverride,
            }
          : undefined;
        const flopKey = computeFlopKey(flop.boardText, treeOverrides);
        const resultKey = `${situationKey}-${flopKey}`;
        const existingRecord = await getResearchRun(situationKey, flopKey);

        if (cachedMap.has(flopKey)) {
          const cachedValue = cachedMap.get(flopKey)?.value as PersistedBatchValue;
          const cachedSnapshot =
            cachedValue.snapshot ||
            createResearchPresetSnapshot(
              (cachedMap.get(flopKey)?.presetId || runPreset.id) as ResearchPresetId,
              cachedValue.board,
              cachedValue.flop.flopBetOverride
                ? {
                    oopFlopBet: cachedValue.flop.flopBetOverride,
                    ipFlopBet: cachedValue.flop.flopBetOverride,
                  }
                : undefined
            );

          if (!cachedValue.snapshot) {
            await putResearchRun({
              situationKey,
              flopKey,
              presetId: cachedMap.get(flopKey)?.presetId || runPreset.id,
              presetLabel: cachedMap.get(flopKey)?.presetLabel || runPreset.label,
              boardText: cachedMap.get(flopKey)?.boardText || flop.boardText,
              updatedAt: cachedMap.get(flopKey)?.updatedAt || Date.now(),
              value: {
                ...cachedValue,
                snapshot: cachedSnapshot,
              } satisfies PersistedBatchValue,
            });
          }

          upsertResult({
            key: resultKey,
            situationKey,
            flopKey,
            presetLabel: cachedMap.get(flopKey)?.presetLabel || runPreset.label,
            flop: cachedValue.flop,
            board: cachedValue.board,
            snapshot: cachedSnapshot,
            outcome: cachedValue.outcome,
            error: cachedValue.error,
            hasSerializedGame: hasSerializedGame(cachedValue.serializedGame),
          });
          statusText.value = `CACHE ${index + 1}/${runFlops.length} ${flop.label}`;
          continue;
        }

        const snapshot = captureConfigSnapshot(config, board, treeOverrides);

        try {
          const solveResult: BatchSolveResult = await runBatchSolve(snapshot, {
            numThreads: runNumThreads,
            targetExploitabilityPercent: runTargetExploitability,
            maxIterations: runMaxIterations,
            treeDepth: runTreeDepth,
            flopIndex: index + 1,
            flopCount: runFlops.length,
            flopLabel: flop.label,
            forceCompression: isSingleRaisedPotResearchPreset(runPreset.id),
            shouldStop: () => stopRequested.value,
            onProgress: (progress) => {
              refreshWorkerRuntimeText();
              statusText.value = `${progress.stage.toUpperCase()} ${progress.flopIndex}/${progress.flopCount} ${progress.flopLabel} | iteration ${progress.currentIteration}/${progress.maxIterations} | exploitability ${formatAdaptive(progress.exploitability)}`;
            },
          });

          const outcome = solveResult.outcome;

          outcome.rootSummary.actions = normalizeActions(outcome.rootSummary.actions);
          const previousValue = existingRecord?.value as PersistedBatchValue | undefined;
          const previousSerializedGame = toPersistedSerializedGame(
            previousValue?.serializedGame
          );
          const serializedGame =
            toPersistedSerializedGame(solveResult.serializedGame) || previousSerializedGame;
          refreshWorkerRuntimeText();
          const persisted = await putResearchRun({
            situationKey,
            flopKey,
            presetId: runPreset.id,
            presetLabel: runPreset.label,
            boardText: flop.boardText,
            updatedAt: Date.now(),
            value: {
              flop,
              board,
              snapshot,
              serializedGame,
              outcome,
              error: null,
            } satisfies PersistedBatchValue,
          });

          const persistedRecord = persisted
            ? await getResearchRun(situationKey, flopKey)
            : undefined;
          const persistedValue = persistedRecord?.value as PersistedBatchValue | undefined;
          const persistedHasSerializedGame = hasSerializedGame(
            persistedValue?.serializedGame
          );

          upsertResult({
            key: resultKey,
            situationKey,
            flopKey,
            presetLabel: runPreset.label,
            flop,
            board,
            snapshot,
            outcome,
            error: null,
            hasSerializedGame: persistedHasSerializedGame,
          });

          if (!persisted) {
            statusText.value = `Solved ${flop.label}, but failed to write the research result to cache.`;
          } else if (solveResult.serializedGame && !persistedHasSerializedGame) {
            statusText.value = `Solved ${flop.label}, but the native result tree was not persisted.`;
          } else if (solveResult.serializationError && !previousSerializedGame) {
            statusText.value = `Solved ${flop.label}, but native tree export failed: ${solveResult.serializationError}`;
          } else if (solveResult.serializationError && previousSerializedGame) {
            statusText.value = `Solved ${flop.label}. Kept the previous native tree because the new export failed: ${solveResult.serializationError}`;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (stopRequested.value && message === "Batch solve stopped.") {
            break;
          }

          const batchResult = {
            key: resultKey,
            situationKey,
            flopKey,
            presetLabel: runPreset.label,
            flop,
            board,
            snapshot,
            outcome: null,
            error: message,
            hasSerializedGame: false,
          };
          upsertResult(batchResult);
          refreshWorkerRuntimeText();
          await putResearchRun({
            situationKey,
            flopKey,
            presetId: runPreset.id,
            presetLabel: runPreset.label,
            boardText: flop.boardText,
            updatedAt: Date.now(),
            value: {
              flop,
              board,
              snapshot,
              outcome: null,
              error: message,
            } satisfies PersistedBatchValue,
          });
        }
      }

      isRunning.value = false;
      refreshWorkerRuntimeText();
      statusText.value = stopRequested.value
        ? `Batch stopped on ${activeRunPresetLabel.value} with ${results.value.length} flop results kept.`
        : `Batch finished on ${runFlops.length} flops.`;
      stopRequested.value = false;
      activeRunPresetLabel.value = "";
    };

    return {
      presets,
      flops,
      selectedPresetId,
      selectedFlopIds,
      customBoardsText,
      numThreads,
      supportsSharedThreads,
      targetExploitability,
      maxIterations,
      treeDepth,
      forceRecalculate,
      isRunning,
      isLoadingCachedResults,
      isDeletingCache,
      results,
      aggregateFlopSummaries,
      invalidCustomBoards,
      selectedRepresentativeFlopCount,
      validCustomFlopCount,
      effectiveFlopListText,
      llmPrompt,
      progressTitle,
      progressText,
      workerRuntimeText,
      workerRuntimeClass,
      researchInitError,
      formatAdaptive,
      formatPercent,
      formatMs,
      loadSelectedPreset,
      presetCardClass,
      toggleFlop,
      selectAllFlops,
      clearResults,
      deletePresetCache,
      deleteFlopCache,
      syncResultsFromCache,
      stopResearch,
      openResultPage,
      copyLlmPrompt,
      runResearch,
      getFlopPlayerActions,
      getFlopPlayerContext,
      selectedPreset,
      activeRunPresetLabel,
    };
  },
});
</script>