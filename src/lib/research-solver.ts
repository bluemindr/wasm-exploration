import { handler, init } from "../global-worker";
import { type ConfigStore } from "./solver-config";
import { average, cardText, convertBetString } from "../utils";

export type SolverConfigSnapshot = {
  rangeRaw: [Float32Array, Float32Array];
  board: number[];
  startingPot: number;
  effectiveStack: number;
  rakePercent: number;
  rakeCap: number;
  donkOption: boolean;
  oopFlopBet: string;
  oopFlopRaise: string;
  oopTurnBet: string;
  oopTurnRaise: string;
  oopTurnDonk: string;
  oopRiverBet: string;
  oopRiverRaise: string;
  oopRiverDonk: string;
  ipFlopBet: string;
  ipFlopRaise: string;
  ipTurnBet: string;
  ipTurnRaise: string;
  ipRiverBet: string;
  ipRiverRaise: string;
  addAllInThreshold: number;
  forceAllInThreshold: number;
  mergingThreshold: number;
  addedLines: string;
  removedLines: string;
};

export type FlopTreeOverrides = {
  oopFlopBet?: string;
  ipFlopBet?: string;
};

export type SolverProgress = {
  stage: "building" | "allocating" | "iterating" | "finalizing" | "done";
  flopIndex: number;
  flopCount: number;
  flopLabel: string;
  currentIteration: number;
  maxIterations: number;
  exploitability: number;
};

export type RootActionSummary = {
  index: number;
  name: string;
  amount: number;
  label: string;
  frequency: number;
  ev: number | null;
};

export type FlopPlayerSummary = {
  player: "oop" | "ip";
  actions: RootActionSummary[];
  contextLabel: string | null;
};

export type DecisionTreeNode = {
  path: string[];
  player: "oop" | "ip" | "chance" | "terminal";
  actionLabels: string[];
  actionFrequencies: number[];
  children: DecisionTreeNode[];
  note?: string;
};

export type RootSummary = {
  currentPlayer: "oop" | "ip" | "chance" | "terminal";
  combos: [number, number];
  equity: [number, number];
  ev: [number, number];
  eqr: [number, number];
  actions: RootActionSummary[];
  flopPlayerSummaries?: {
    oop: FlopPlayerSummary;
    ip: FlopPlayerSummary;
  };
  boardText: string;
  treePreview: DecisionTreeNode | null;
};

export type SolveOutcome = {
  currentIteration: number;
  exploitability: number;
  elapsedTimeMs: number;
  memoryUsage: number;
  memoryUsageCompressed: number;
  compressionEnabled: boolean;
  rootSummary: RootSummary;
};

export type BatchSolveResult = {
  outcome: SolveOutcome;
  serializedGame?: Uint8Array;
  serializationError: string | null;
};

export type ReplaySolveProgress = {
  stage: "building" | "allocating" | "iterating" | "finalizing" | "done";
  currentIteration: number;
  totalIterations: number;
  exploitability: number;
};

export type RunBatchSolveOptions = {
  numThreads: number;
  targetExploitabilityPercent: number;
  maxIterations: number;
  treeDepth: number;
  flopIndex: number;
  flopCount: number;
  flopLabel: string;
  forceCompression?: boolean;
  onProgress?: (progress: SolverProgress) => void;
  shouldStop?: () => boolean;
};

export type SituationKeyOptions = {
  targetExploitabilityPercent: number;
  maxIterations: number;
  treeDepth: number;
};

type ParsedResults = {
  currentPlayer: "oop" | "ip" | "chance" | "terminal";
  numActions: number;
  isEmpty: number;
  eqrBase: [number, number];
  weights: [number[], number[]];
  normalizer: [number[], number[]];
  equity: [number[], number[]];
  ev: [number[], number[]];
  eqr: [number[], number[]];
  strategy: number[];
  actionEv: number[];
  cards: [number[], number[]];
};

const maxMemoryUsage = 3.9 * 1024 * 1024 * 1024;

const persistenceCompressionLevel = -1;

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; ++i) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

const hashFloatArray = (values: ArrayLike<number>) => {
  let hash = 2166136261;
  for (let i = 0; i < values.length; ++i) {
    const normalized = Math.round(Number(values[i]) * 10000);
    hash ^= normalized;
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

const parseActionString = (value: string, index: number): RootActionSummary => {
  const [name, amountString] = value.split(":");
  const amount = Number(amountString);
  return {
    index,
    name,
    amount,
    label: amount > 0 ? `${name} ${amount}` : name,
    frequency: 0,
    ev: null,
  };
};

const safeAverage = (values: number[], weights: number[]) => {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight <= 0) {
    return Number.NaN;
  }

  return average(values, weights);
};

const boardToText = (board: number[]) =>
  board.map((card) => {
    const { rank, suitLetter } = cardText(card);
    return `${rank}${suitLetter}`;
  });

const asNumberArray = (values: ArrayLike<number>): number[] =>
  Array.from(values, (value) => Number(value));

const getCurrentHandler = () => {
  if (!handler) {
    throw new Error("Solver handler is not initialized");
  }

  return handler;
};

export const computeTreeKey = (config: ConfigStore, presetId: string) => {
  const payload = [
    presetId,
    hashFloatArray(config.rangeRaw[0]),
    hashFloatArray(config.rangeRaw[1]),
    config.startingPot,
    config.effectiveStack,
    config.rakePercent,
    config.rakeCap,
    config.donkOption ? 1 : 0,
    config.oopFlopBet,
    config.oopFlopRaise,
    config.oopTurnBet,
    config.oopTurnRaise,
    config.oopTurnDonk,
    config.oopRiverBet,
    config.oopRiverRaise,
    config.oopRiverDonk,
    config.ipFlopBet,
    config.ipFlopRaise,
    config.ipTurnBet,
    config.ipTurnRaise,
    config.ipRiverBet,
    config.ipRiverRaise,
    config.addAllInThreshold,
    config.forceAllInThreshold,
    config.mergingThreshold,
    config.expectedBoardLength,
    config.addedLines,
    config.removedLines,
  ].join("|");

  return hashString(payload);
};

export const computeTreeKeyFromSnapshot = (
  snapshot: Pick<
    SolverConfigSnapshot,
    | "rangeRaw"
    | "startingPot"
    | "effectiveStack"
    | "rakePercent"
    | "rakeCap"
    | "donkOption"
    | "oopFlopBet"
    | "oopFlopRaise"
    | "oopTurnBet"
    | "oopTurnRaise"
    | "oopTurnDonk"
    | "oopRiverBet"
    | "oopRiverRaise"
    | "oopRiverDonk"
    | "ipFlopBet"
    | "ipFlopRaise"
    | "ipTurnBet"
    | "ipTurnRaise"
    | "ipRiverBet"
    | "ipRiverRaise"
    | "addAllInThreshold"
    | "forceAllInThreshold"
    | "mergingThreshold"
    | "addedLines"
    | "removedLines"
  >,
  presetId: string
) => {
  const payload = [
    presetId,
    hashFloatArray(snapshot.rangeRaw[0]),
    hashFloatArray(snapshot.rangeRaw[1]),
    snapshot.startingPot,
    snapshot.effectiveStack,
    snapshot.rakePercent,
    snapshot.rakeCap,
    snapshot.donkOption ? 1 : 0,
    snapshot.oopFlopBet,
    snapshot.oopFlopRaise,
    snapshot.oopTurnBet,
    snapshot.oopTurnRaise,
    snapshot.oopTurnDonk,
    snapshot.oopRiverBet,
    snapshot.oopRiverRaise,
    snapshot.oopRiverDonk,
    snapshot.ipFlopBet,
    snapshot.ipFlopRaise,
    snapshot.ipTurnBet,
    snapshot.ipTurnRaise,
    snapshot.ipRiverBet,
    snapshot.ipRiverRaise,
    snapshot.addAllInThreshold,
    snapshot.forceAllInThreshold,
    snapshot.mergingThreshold,
    0,
    snapshot.addedLines,
    snapshot.removedLines,
  ].join("|");

  return hashString(payload);
};

export const computeSituationKey = (
  config: ConfigStore,
  presetId: string,
  options: SituationKeyOptions
) => {
  const treeKey = computeTreeKey(config, presetId);
  const payload = [
    treeKey,
    options.targetExploitabilityPercent,
    options.maxIterations,
    options.treeDepth,
  ].join("|");

  return hashString(payload);
};

export const computeSituationKeyFromSnapshot = (
  snapshot: Pick<
    SolverConfigSnapshot,
    | "rangeRaw"
    | "startingPot"
    | "effectiveStack"
    | "rakePercent"
    | "rakeCap"
    | "donkOption"
    | "oopFlopBet"
    | "oopFlopRaise"
    | "oopTurnBet"
    | "oopTurnRaise"
    | "oopTurnDonk"
    | "oopRiverBet"
    | "oopRiverRaise"
    | "oopRiverDonk"
    | "ipFlopBet"
    | "ipFlopRaise"
    | "ipTurnBet"
    | "ipTurnRaise"
    | "ipRiverBet"
    | "ipRiverRaise"
    | "addAllInThreshold"
    | "forceAllInThreshold"
    | "mergingThreshold"
    | "addedLines"
    | "removedLines"
  >,
  presetId: string,
  options: SituationKeyOptions
) => {
  const treeKey = computeTreeKeyFromSnapshot(snapshot, presetId);
  const payload = [
    treeKey,
    options.targetExploitabilityPercent,
    options.maxIterations,
    options.treeDepth,
  ].join("|");

  return hashString(payload);
};

export const computeFlopKey = (
  boardText: string,
  treeOverrides?: FlopTreeOverrides
) => {
  return hashString(
    [
      boardText.replace(/\s+/g, ""),
      treeOverrides?.oopFlopBet || "",
      treeOverrides?.ipFlopBet || "",
    ].join("|")
  );
};

export const captureConfigSnapshot = (
  config: ConfigStore,
  boardOverride?: number[],
  treeOverrides?: FlopTreeOverrides
): SolverConfigSnapshot => ({
  rangeRaw: [
    Float32Array.from(config.rangeRaw[0]),
    Float32Array.from(config.rangeRaw[1]),
  ],
  board: [...(boardOverride ?? config.board)],
  startingPot: config.startingPot,
  effectiveStack: config.effectiveStack,
  rakePercent: config.rakePercent,
  rakeCap: config.rakeCap,
  donkOption: config.donkOption,
  oopFlopBet: treeOverrides?.oopFlopBet ?? config.oopFlopBet,
  oopFlopRaise: config.oopFlopRaise,
  oopTurnBet: config.oopTurnBet,
  oopTurnRaise: config.oopTurnRaise,
  oopTurnDonk: config.oopTurnDonk,
  oopRiverBet: config.oopRiverBet,
  oopRiverRaise: config.oopRiverRaise,
  oopRiverDonk: config.oopRiverDonk,
  ipFlopBet: treeOverrides?.ipFlopBet ?? config.ipFlopBet,
  ipFlopRaise: config.ipFlopRaise,
  ipTurnBet: config.ipTurnBet,
  ipTurnRaise: config.ipTurnRaise,
  ipRiverBet: config.ipRiverBet,
  ipRiverRaise: config.ipRiverRaise,
  addAllInThreshold: config.addAllInThreshold,
  forceAllInThreshold: config.forceAllInThreshold,
  mergingThreshold: config.mergingThreshold,
  addedLines: config.addedLines,
  removedLines: config.removedLines,
});

const buildTree = async (
  snapshot: SolverConfigSnapshot,
  numThreads: number
): Promise<{
  memoryUsage: number;
  memoryUsageCompressed: number;
  compressionEnabled: boolean;
}> => {
  await init(numThreads);
  const solver = getCurrentHandler();

  const errorString = await solver.init(
    snapshot.rangeRaw[0],
    snapshot.rangeRaw[1],
    new Uint8Array(snapshot.board),
    snapshot.startingPot,
    snapshot.effectiveStack,
    snapshot.rakePercent / 100,
    snapshot.rakeCap,
    snapshot.donkOption,
    convertBetString(snapshot.oopFlopBet),
    convertBetString(snapshot.oopFlopRaise),
    convertBetString(snapshot.oopTurnBet),
    convertBetString(snapshot.oopTurnRaise),
    snapshot.donkOption ? convertBetString(snapshot.oopTurnDonk) : "",
    convertBetString(snapshot.oopRiverBet),
    convertBetString(snapshot.oopRiverRaise),
    snapshot.donkOption ? convertBetString(snapshot.oopRiverDonk) : "",
    convertBetString(snapshot.ipFlopBet),
    convertBetString(snapshot.ipFlopRaise),
    convertBetString(snapshot.ipTurnBet),
    convertBetString(snapshot.ipTurnRaise),
    convertBetString(snapshot.ipRiverBet),
    convertBetString(snapshot.ipRiverRaise),
    snapshot.addAllInThreshold / 100,
    snapshot.forceAllInThreshold / 100,
    snapshot.mergingThreshold / 100,
    snapshot.addedLines,
    snapshot.removedLines
  );

  if (errorString) {
    throw new Error(errorString);
  }

  const memoryUsage = await solver.memoryUsage(false);
  const memoryUsageCompressed = await solver.memoryUsage(true);
  const compressionEnabled =
    memoryUsage > maxMemoryUsage && memoryUsageCompressed <= maxMemoryUsage;

  if (memoryUsage > maxMemoryUsage && memoryUsageCompressed > maxMemoryUsage) {
    throw new Error(
      "Tree exceeds the 4GB WebAssembly budget in both precision modes."
    );
  }

  return {
    memoryUsage,
    memoryUsageCompressed,
    compressionEnabled,
  };
};

const parseResults = async (): Promise<ParsedResults> => {
  const solver = getCurrentHandler();
  const cards: [number[], number[]] = [
    asNumberArray(await solver.privateCards(0)),
    asNumberArray(await solver.privateCards(1)),
  ];

  const currentPlayer =
    (await solver.currentPlayer()) as ParsedResults["currentPlayer"];
  const numActions =
    currentPlayer === "oop" || currentPlayer === "ip"
      ? await solver.numActions()
      : 0;

  const buffer = asNumberArray(await solver.getResults());
  const lengths = [cards[0].length, cards[1].length] as const;

  let offset = 0;
  const eqrBase = [buffer[offset++], buffer[offset++]] as [number, number];
  const isEmpty = Number(buffer[offset++] ?? 0);

  const weights: [number[], number[]] = [
    buffer.slice(offset, offset + lengths[0]),
    buffer.slice(offset + lengths[0], offset + lengths[0] + lengths[1]),
  ];
  offset += lengths[0] + lengths[1];

  const normalizer: [number[], number[]] = [
    buffer.slice(offset, offset + lengths[0]),
    buffer.slice(offset + lengths[0], offset + lengths[0] + lengths[1]),
  ];
  offset += lengths[0] + lengths[1];

  const equity: [number[], number[]] = [[], []];
  const ev: [number[], number[]] = [[], []];
  const eqr: [number[], number[]] = [[], []];

  if (!isEmpty) {
    equity[0] = buffer.slice(offset, offset + lengths[0]);
    offset += lengths[0];
    equity[1] = buffer.slice(offset, offset + lengths[1]);
    offset += lengths[1];

    ev[0] = buffer.slice(offset, offset + lengths[0]);
    offset += lengths[0];
    ev[1] = buffer.slice(offset, offset + lengths[1]);
    offset += lengths[1];

    eqr[0] = buffer.slice(offset, offset + lengths[0]);
    offset += lengths[0];
    eqr[1] = buffer.slice(offset, offset + lengths[1]);
    offset += lengths[1];
  }

  let strategy: number[] = [];
  let actionEv: number[] = [];

  if (currentPlayer === "oop" || currentPlayer === "ip") {
    const playerIndex = currentPlayer === "oop" ? 0 : 1;
    const playerLength = lengths[playerIndex];
    strategy = buffer.slice(offset, offset + numActions * playerLength);
    offset += numActions * playerLength;

    if (!isEmpty) {
      actionEv = buffer.slice(offset, offset + numActions * playerLength);
      offset += numActions * playerLength;
    }
  }

  return {
    currentPlayer,
    numActions,
    isEmpty,
    eqrBase,
    weights,
    normalizer,
    equity,
    ev,
    eqr,
    strategy,
    actionEv,
    cards,
  };
};

const summarizePlayerActionsAtHistory = async (
  history: number[] = []
): Promise<{
  currentPlayer: "oop" | "ip" | "chance" | "terminal";
  actions: RootActionSummary[];
}> => {
  const solver = getCurrentHandler();
  await solver.applyHistory(new Uint32Array(history));

  const parsed = await parseResults();
  if (parsed.currentPlayer !== "oop" && parsed.currentPlayer !== "ip") {
    return {
      currentPlayer: parsed.currentPlayer,
      actions: [],
    };
  }

  const actionValues: RootActionSummary[] = (
    await solver.actionsAfter(new Uint32Array())
  )
    .split("/")
    .filter(Boolean)
    .map(parseActionString);

  const playerIndex = parsed.currentPlayer === "oop" ? 0 : 1;
  const playerLength = parsed.cards[playerIndex].length;

  const actions = actionValues.map((action: RootActionSummary) => {
    const start = action.index * playerLength;
    const end = start + playerLength;
    const strategySlice = parsed.strategy.slice(start, end);
    const actionEvSlice = parsed.actionEv.slice(start, end);

    const frequency = safeAverage(
      strategySlice,
      parsed.normalizer[playerIndex]
    );
    const actionEv =
      actionEvSlice.length === playerLength
        ? safeAverage(actionEvSlice, parsed.normalizer[playerIndex])
        : Number.NaN;

    return {
      ...action,
      frequency: isFinite(frequency) ? frequency : 0,
      ev: isFinite(actionEv) ? actionEv : null,
    };
  });

  return {
    currentPlayer: parsed.currentPlayer,
    actions,
  };
};

const summarizeRoot = async (
  treeDepth: number,
  board: number[]
): Promise<RootSummary> => {
  const solver = getCurrentHandler();
  const parsed = await parseResults();

  const combos: [number, number] = [0, 0];
  for (const playerIndex of [0, 1] as const) {
    let sum = 0;
    for (let i = 0; i < parsed.weights[playerIndex].length; ++i) {
      if (parsed.normalizer[playerIndex][i] > 0) {
        sum += parsed.weights[playerIndex][i];
      }
    }
    combos[playerIndex] = sum;
  }

  const equity: [number, number] = parsed.isEmpty
    ? [Number.NaN, Number.NaN]
    : [
        safeAverage(parsed.equity[0], parsed.normalizer[0]),
        safeAverage(parsed.equity[1], parsed.normalizer[1]),
      ];

  const ev: [number, number] = parsed.isEmpty
    ? [Number.NaN, Number.NaN]
    : [
        safeAverage(parsed.ev[0], parsed.normalizer[0]),
        safeAverage(parsed.ev[1], parsed.normalizer[1]),
      ];

  const eqr: [number, number] = [
    ev[0] / (parsed.eqrBase[0] * equity[0]),
    ev[1] / (parsed.eqrBase[1] * equity[1]),
  ];

  for (const playerIndex of [0, 1] as const) {
    if (!isFinite(eqr[playerIndex])) {
      eqr[playerIndex] = Number.NaN;
    }
  }

  const rootActionSummary = await summarizePlayerActionsAtHistory();
  const actions = rootActionSummary.actions;

  const oopFlopSummary = {
    player: "oop" as const,
    actions:
      rootActionSummary.currentPlayer === "oop"
        ? rootActionSummary.actions
        : [],
    contextLabel: null,
  };

  let ipFlopSummary = {
    player: "ip" as const,
    actions:
      rootActionSummary.currentPlayer === "ip" ? rootActionSummary.actions : [],
    contextLabel: null as string | null,
  };

  if (rootActionSummary.currentPlayer === "oop") {
    const oopCheckAction = rootActionSummary.actions.find(
      (action) => action.amount === 0 || action.name === "Check"
    );

    if (oopCheckAction) {
      const ipActionSummary = await summarizePlayerActionsAtHistory([
        oopCheckAction.index,
      ]);
      if (ipActionSummary.currentPlayer === "ip") {
        ipFlopSummary = {
          player: "ip",
          actions: ipActionSummary.actions,
          contextLabel: `After ${oopCheckAction.label}`,
        };
      }
    }
  }

  await solver.applyHistory(new Uint32Array());

  let treePreview: DecisionTreeNode | null = null;
  try {
    treePreview = await buildDecisionPreview(treeDepth);
  } catch {
    treePreview = null;
  }

  return {
    currentPlayer: parsed.currentPlayer,
    combos,
    equity,
    ev,
    eqr,
    actions,
    flopPlayerSummaries: {
      oop: oopFlopSummary,
      ip: ipFlopSummary,
    },
    boardText: boardToText(board).join(" "),
    treePreview,
  };
};

const buildDecisionPreview = async (
  maxDepth: number,
  history: number[] = [],
  path: string[] = []
): Promise<DecisionTreeNode | null> => {
  if (maxDepth < 0) {
    return null;
  }

  const solver = getCurrentHandler();
  await solver.applyHistory(new Uint32Array(history));

  const currentPlayer =
    (await solver.currentPlayer()) as DecisionTreeNode["player"];
  if (currentPlayer === "terminal") {
    return {
      path,
      player: "terminal",
      actionLabels: [],
      actionFrequencies: [],
      children: [],
      note: "Terminal node",
    };
  }

  if (currentPlayer === "chance") {
    return {
      path,
      player: "chance",
      actionLabels: [],
      actionFrequencies: [],
      children: [],
      note: "Chance node collapsed over future cards",
    };
  }

  const parsed = await parseResults();
  const actionsText: RootActionSummary[] = (
    await solver.actionsAfter(new Uint32Array())
  )
    .split("/")
    .filter(Boolean)
    .map(parseActionString);
  const playerIndex = currentPlayer === "oop" ? 0 : 1;
  const playerLength = parsed.cards[playerIndex].length;

  const frequencies = actionsText.map((action: RootActionSummary) => {
    const start = action.index * playerLength;
    const end = start + playerLength;
    const slice = parsed.strategy.slice(start, end);
    const value = safeAverage(slice, parsed.normalizer[playerIndex]);
    return isFinite(value) ? value : 0;
  });

  const children: DecisionTreeNode[] = [];
  if (maxDepth > 0) {
    for (const action of actionsText) {
      const child = await buildDecisionPreview(
        maxDepth - 1,
        [...history, action.index],
        [...path, action.label]
      );
      if (child) {
        children.push(child);
      }
    }
  }

  await solver.applyHistory(new Uint32Array(history));

  return {
    path,
    player: currentPlayer,
    actionLabels: actionsText.map((action: RootActionSummary) => action.label),
    actionFrequencies: frequencies,
    children,
  };
};

let isSolverLocked = false;

export const runBatchSolve = async (
  snapshot: SolverConfigSnapshot,
  options: RunBatchSolveOptions
): Promise<BatchSolveResult> => {
  if (isSolverLocked) {
    throw new Error("Solver is already running another task.");
  }
  isSolverLocked = true;

  try {
    options.onProgress?.({
      stage: "building",
      flopIndex: options.flopIndex,
      flopCount: options.flopCount,
      flopLabel: options.flopLabel,
      currentIteration: 0,
      maxIterations: options.maxIterations,
      exploitability: Number.POSITIVE_INFINITY,
    });

    const buildStats = await buildTree(snapshot, options.numThreads);
    const solver = getCurrentHandler();
    const compressionEnabled = options.forceCompression
      ? true
      : buildStats.compressionEnabled;

    options.onProgress?.({
      stage: "allocating",
      flopIndex: options.flopIndex,
      flopCount: options.flopCount,
      flopLabel: options.flopLabel,
      currentIteration: 0,
      maxIterations: options.maxIterations,
      exploitability: Number.POSITIVE_INFINITY,
    });

    const startedAt = performance.now();
    await solver.allocateMemory(compressionEnabled);

    if (options.shouldStop?.()) {
      throw new Error("Batch solve stopped.");
    }

    let currentIteration = 0;
    let exploitability = Math.max(await solver.exploitability(), 0);
    const target =
      (snapshot.startingPot * options.targetExploitabilityPercent) / 100;

    options.onProgress?.({
      stage: "iterating",
      flopIndex: options.flopIndex,
      flopCount: options.flopCount,
      flopLabel: options.flopLabel,
      currentIteration,
      maxIterations: options.maxIterations,
      exploitability,
    });

    while (
      !options.shouldStop?.() &&
      currentIteration < options.maxIterations &&
      exploitability > target
    ) {
      await solver.iterate(currentIteration);
      currentIteration += 1;

      if (currentIteration % 10 === 0) {
        exploitability = Math.max(await solver.exploitability(), 0);
        options.onProgress?.({
          stage: "iterating",
          flopIndex: options.flopIndex,
          flopCount: options.flopCount,
          flopLabel: options.flopLabel,
          currentIteration,
          maxIterations: options.maxIterations,
          exploitability,
        });
      }
    }

    if (options.shouldStop?.()) {
      throw new Error("Batch solve stopped.");
    }

    exploitability = Math.max(await solver.exploitability(), 0);
    options.onProgress?.({
      stage: "finalizing",
      flopIndex: options.flopIndex,
      flopCount: options.flopCount,
      flopLabel: options.flopLabel,
      currentIteration,
      maxIterations: options.maxIterations,
      exploitability,
    });

    let serializedGame: Uint8Array | undefined;
    let serializationError: string | null = null;

    try {
      const exportedSerializedGame = await exportSolvedGame();
      serializedGame = new Uint8Array(exportedSerializedGame).slice();
      if (serializedGame.byteLength === 0) {
        throw new Error(
          "Serialized solver tree export returned an empty buffer."
        );
      }
    } catch (error) {
      serializationError =
        error instanceof Error ? error.message : String(error);
    }

    const elapsedTimeMs = performance.now() - startedAt;
    const rootSummary = await summarizeRoot(options.treeDepth, snapshot.board);

    options.onProgress?.({
      stage: "done",
      flopIndex: options.flopIndex,
      flopCount: options.flopCount,
      flopLabel: options.flopLabel,
      currentIteration,
      maxIterations: options.maxIterations,
      exploitability,
    });

    return {
      outcome: {
        currentIteration,
        exploitability,
        elapsedTimeMs,
        memoryUsage: buildStats.memoryUsage,
        memoryUsageCompressed: buildStats.memoryUsageCompressed,
        compressionEnabled,
        rootSummary: {
          ...rootSummary,
          boardText: boardToText(snapshot.board).join(" "),
        },
      },
      serializedGame,
      serializationError,
    };
  } finally {
    if (handler) {
      try {
        await handler.finalize();
      } catch (e) {
        // Ignore finalization errors
      }
    }
    isSolverLocked = false;
  }
};

export const exportSolvedGame = async () => {
  const solver = getCurrentHandler();
  return (await solver.saveGame(persistenceCompressionLevel)) as ArrayBuffer;
};

export const loadSerializedGame = async (
  serializedGame: Uint8Array,
  numThreads: number
) => {
  await init(numThreads);
  const solver = getCurrentHandler();
  const errorString = await solver.loadGame(serializedGame, maxMemoryUsage);

  if (errorString) {
    throw new Error(errorString);
  }

  return {
    exploitability: Math.max(await solver.exploitability(), 0),
  };
};

export const replaySolvedResult = async (
  snapshot: SolverConfigSnapshot,
  outcome: Pick<SolveOutcome, "currentIteration" | "compressionEnabled">,
  numThreads: number,
  onProgress?: (progress: ReplaySolveProgress) => void
) => {
  onProgress?.({
    stage: "building",
    currentIteration: 0,
    totalIterations: outcome.currentIteration,
    exploitability: Number.POSITIVE_INFINITY,
  });

  const buildStats = await buildTree(snapshot, numThreads);
  const solver = getCurrentHandler();

  onProgress?.({
    stage: "allocating",
    currentIteration: 0,
    totalIterations: outcome.currentIteration,
    exploitability: Number.POSITIVE_INFINITY,
  });

  await solver.allocateMemory(outcome.compressionEnabled);

  let exploitability = Math.max(await solver.exploitability(), 0);
  onProgress?.({
    stage: "iterating",
    currentIteration: 0,
    totalIterations: outcome.currentIteration,
    exploitability,
  });

  for (let iteration = 0; iteration < outcome.currentIteration; ++iteration) {
    await solver.iterate(iteration);

    if (
      (iteration + 1) % 10 === 0 ||
      iteration + 1 === outcome.currentIteration
    ) {
      exploitability = Math.max(await solver.exploitability(), 0);
      onProgress?.({
        stage: "iterating",
        currentIteration: iteration + 1,
        totalIterations: outcome.currentIteration,
        exploitability,
      });
    }
  }

  exploitability = Math.max(await solver.exploitability(), 0);
  onProgress?.({
    stage: "finalizing",
    currentIteration: outcome.currentIteration,
    totalIterations: outcome.currentIteration,
    exploitability,
  });

  await solver.finalize();

  onProgress?.({
    stage: "done",
    currentIteration: outcome.currentIteration,
    totalIterations: outcome.currentIteration,
    exploitability,
  });

  return {
    memoryUsage: buildStats.memoryUsage,
    memoryUsageCompressed: buildStats.memoryUsageCompressed,
    exploitability,
  };
};
