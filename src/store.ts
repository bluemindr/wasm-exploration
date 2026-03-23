import { defineStore } from "pinia";
import { sanitizeBetString } from "./utils";

export type NavView = "solver" | "research" | "results";

export type ResearchResultSelection = {
  situationKey: string;
  flopKey: string;
  presetLabel: string;
  boardText: string;
  flopLabel: string;
};

type ResearchResultStoreTarget = {
  selectedResearchResult: ResearchResultSelection | null;
  navView: NavView;
};

const RESEARCH_RESULT_VIEW = "research-result";

const updateResearchResultUrl = (selection: ResearchResultSelection | null) => {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);

  if (selection) {
    url.searchParams.set("view", RESEARCH_RESULT_VIEW);
    url.searchParams.set("situationKey", selection.situationKey);
    url.searchParams.set("flopKey", selection.flopKey);
    url.searchParams.set("presetLabel", selection.presetLabel);
    url.searchParams.set("boardText", selection.boardText);
    url.searchParams.set("flopLabel", selection.flopLabel);
  } else {
    if (url.searchParams.get("view") !== RESEARCH_RESULT_VIEW) {
      return;
    }

    url.searchParams.delete("view");
    url.searchParams.delete("situationKey");
    url.searchParams.delete("flopKey");
    url.searchParams.delete("presetLabel");
    url.searchParams.delete("boardText");
    url.searchParams.delete("flopLabel");
  }

  const search = url.searchParams.toString();
  const nextUrl = `${url.pathname}${search ? `?${search}` : ""}${url.hash}`;
  window.history.replaceState(null, "", nextUrl);
};

export const buildResearchResultUrl = (selection: ResearchResultSelection) => {
  const baseUrl =
    typeof window === "undefined" ? "http://localhost/" : window.location.href;
  const url = new URL(baseUrl);

  url.searchParams.set("view", RESEARCH_RESULT_VIEW);
  url.searchParams.set("situationKey", selection.situationKey);
  url.searchParams.set("flopKey", selection.flopKey);
  url.searchParams.set("presetLabel", selection.presetLabel);
  url.searchParams.set("boardText", selection.boardText);
  url.searchParams.set("flopLabel", selection.flopLabel);

  return url.toString();
};

export const parseResearchResultSelectionFromUrl = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const url = new URL(window.location.href);
  if (url.searchParams.get("view") !== RESEARCH_RESULT_VIEW) {
    return null;
  }

  const situationKey = url.searchParams.get("situationKey");
  const flopKey = url.searchParams.get("flopKey");
  const presetLabel = url.searchParams.get("presetLabel");
  const boardText = url.searchParams.get("boardText");
  const flopLabel = url.searchParams.get("flopLabel");

  if (!situationKey || !flopKey || !presetLabel || !boardText || !flopLabel) {
    return null;
  }

  return {
    situationKey,
    flopKey,
    presetLabel,
    boardText,
    flopLabel,
  } satisfies ResearchResultSelection;
};

export const showResearchResult = (
  store: ResearchResultStoreTarget,
  selection: ResearchResultSelection,
  syncUrl = true
) => {
  store.selectedResearchResult = selection;
  store.navView = "results";

  if (syncUrl) {
    updateResearchResultUrl(selection);
  }
};

export const clearResearchResultSelection = (
  store: ResearchResultStoreTarget,
  navView: NavView,
  clearUrl = true
) => {
  store.selectedResearchResult = null;
  store.navView = navView;

  if (clearUrl) {
    updateResearchResultUrl(null);
  }
};

export type SideView =
  | "about"
  | "oop-range"
  | "ip-range"
  | "board"
  | "tree-config"
  | "run-solver";

export const saveConfigTmp = () => {
  const config = useConfigStore();
  const tmpConfig = useTmpConfigStore();

  tmpConfig.rangeRaw[0].set(config.rangeRaw[0]);
  tmpConfig.rangeRaw[1].set(config.rangeRaw[1]);

  tmpConfig.$patch({
    board: [...config.board],
    startingPot: config.startingPot,
    effectiveStack: config.effectiveStack,
    rakePercent: config.rakePercent,
    rakeCap: config.rakeCap,
    donkOption: config.donkOption,
    oopFlopBet: config.oopFlopBet,
    oopFlopRaise: config.oopFlopRaise,
    oopTurnBet: config.oopTurnBet,
    oopTurnRaise: config.oopTurnRaise,
    oopTurnDonk: config.oopTurnDonk,
    oopRiverBet: config.oopRiverBet,
    oopRiverRaise: config.oopRiverRaise,
    oopRiverDonk: config.oopRiverDonk,
    ipFlopBet: config.ipFlopBet,
    ipFlopRaise: config.ipFlopRaise,
    ipTurnBet: config.ipTurnBet,
    ipTurnRaise: config.ipTurnRaise,
    ipRiverBet: config.ipRiverBet,
    ipRiverRaise: config.ipRiverRaise,
    addAllInThreshold: config.addAllInThreshold,
    forceAllInThreshold: config.forceAllInThreshold,
    mergingThreshold: config.mergingThreshold,
    expectedBoardLength: config.expectedBoardLength,
    addedLines: config.addedLines,
    removedLines: config.removedLines,
  });
};

export const saveConfig = () => {
  const tmpConfig = useTmpConfigStore();
  const savedConfig = useSavedConfigStore();

  savedConfig.rangeRaw[0].set(tmpConfig.rangeRaw[0]);
  savedConfig.rangeRaw[1].set(tmpConfig.rangeRaw[1]);

  savedConfig.$patch({
    board: tmpConfig.board,
    startingPot: tmpConfig.startingPot,
    effectiveStack: tmpConfig.effectiveStack,
    rakePercent: tmpConfig.rakePercent,
    rakeCap: tmpConfig.rakeCap,
    donkOption: tmpConfig.donkOption,
    oopFlopBet: tmpConfig.oopFlopBet,
    oopFlopRaise: tmpConfig.oopFlopRaise,
    oopTurnBet: tmpConfig.oopTurnBet,
    oopTurnRaise: tmpConfig.oopTurnRaise,
    oopTurnDonk: tmpConfig.oopTurnDonk,
    oopRiverBet: tmpConfig.oopRiverBet,
    oopRiverRaise: tmpConfig.oopRiverRaise,
    oopRiverDonk: tmpConfig.oopRiverDonk,
    ipFlopBet: tmpConfig.ipFlopBet,
    ipFlopRaise: tmpConfig.ipFlopRaise,
    ipTurnBet: tmpConfig.ipTurnBet,
    ipTurnRaise: tmpConfig.ipTurnRaise,
    ipRiverBet: tmpConfig.ipRiverBet,
    ipRiverRaise: tmpConfig.ipRiverRaise,
    addAllInThreshold: tmpConfig.addAllInThreshold,
    forceAllInThreshold: tmpConfig.forceAllInThreshold,
    mergingThreshold: tmpConfig.mergingThreshold,
    expectedBoardLength: tmpConfig.expectedBoardLength,
    addedLines: tmpConfig.addedLines,
    removedLines: tmpConfig.removedLines,
  });
};

export const useStore = defineStore("app", {
  state: () => ({
    navView: "solver" as NavView,
    sideView: "about" as SideView,
    headers: {
      about: ["Welcome to WASM Postflop!"],
      "oop-range": ["OOP Range"],
      "ip-range": ["IP Range"],
      board: ["Board"],
      "tree-config": ["Tree Configuration"],
      "run-solver": ["Run Solver"],
    },
    isSolverRunning: false,
    isFinalizing: false,
    isSolverPaused: false,
    isSolverFinished: false,
    selectedResearchResult: null as ResearchResultSelection | null,
  }),

  getters: {
    hasSolverRun: (state) => {
      return (
        state.isSolverRunning ||
        state.isFinalizing ||
        state.isSolverPaused ||
        state.isSolverFinished
      );
    },
  },
});

export const useConfigStore = defineStore("config", {
  state: () => ({
    range: [
      Array.from({ length: 13 * 13 }, () => 0),
      Array.from({ length: 13 * 13 }, () => 0),
    ],
    rangeRaw: [
      Float32Array.from({ length: (52 * 51) / 2 }, () => 0),
      Float32Array.from({ length: (52 * 51) / 2 }, () => 0),
    ],
    board: [] as number[],
    startingPot: 20,
    effectiveStack: 100,
    rakePercent: 0,
    rakeCap: 0,
    donkOption: false,
    oopFlopBet: "",
    oopFlopRaise: "",
    oopTurnBet: "",
    oopTurnRaise: "",
    oopTurnDonk: "",
    oopRiverBet: "",
    oopRiverRaise: "",
    oopRiverDonk: "",
    ipFlopBet: "",
    ipFlopRaise: "",
    ipTurnBet: "",
    ipTurnRaise: "",
    ipRiverBet: "",
    ipRiverRaise: "",
    addAllInThreshold: 150,
    forceAllInThreshold: 20,
    mergingThreshold: 10,
    expectedBoardLength: 0,
    addedLines: "",
    removedLines: "",
  }),

  getters: {
    oopFlopBetSanitized: (s) => sanitizeBetString(s.oopFlopBet, false),
    oopFlopRaiseSanitized: (s) => sanitizeBetString(s.oopFlopRaise, true),
    oopTurnBetSanitized: (s) => sanitizeBetString(s.oopTurnBet, false),
    oopTurnRaiseSanitized: (s) => sanitizeBetString(s.oopTurnRaise, true),
    oopTurnDonkSanitized: (s) => sanitizeBetString(s.oopTurnDonk, false),
    oopRiverBetSanitized: (s) => sanitizeBetString(s.oopRiverBet, false),
    oopRiverRaiseSanitized: (s) => sanitizeBetString(s.oopRiverRaise, true),
    oopRiverDonkSanitized: (s) => sanitizeBetString(s.oopRiverDonk, false),
    ipFlopBetSanitized: (s) => sanitizeBetString(s.ipFlopBet, false),
    ipFlopRaiseSanitized: (s) => sanitizeBetString(s.ipFlopRaise, true),
    ipTurnBetSanitized: (s) => sanitizeBetString(s.ipTurnBet, false),
    ipTurnRaiseSanitized: (s) => sanitizeBetString(s.ipTurnRaise, true),
    ipRiverBetSanitized: (s) => sanitizeBetString(s.ipRiverBet, false),
    ipRiverRaiseSanitized: (s) => sanitizeBetString(s.ipRiverRaise, true),
  },
});

export const useTmpConfigStore = defineStore("tmpConfig", {
  state: () => ({
    rangeRaw: [
      Float32Array.from({ length: (52 * 51) / 2 }, () => 0),
      Float32Array.from({ length: (52 * 51) / 2 }, () => 0),
    ],
    board: [] as number[],
    startingPot: 0,
    effectiveStack: 0,
    rakePercent: 0,
    rakeCap: 0,
    donkOption: false,
    oopFlopBet: "",
    oopFlopRaise: "",
    oopTurnBet: "",
    oopTurnRaise: "",
    oopTurnDonk: "",
    oopRiverBet: "",
    oopRiverRaise: "",
    oopRiverDonk: "",
    ipFlopBet: "",
    ipFlopRaise: "",
    ipTurnBet: "",
    ipTurnRaise: "",
    ipRiverBet: "",
    ipRiverRaise: "",
    addAllInThreshold: 0,
    forceAllInThreshold: 0,
    mergingThreshold: 0,
    expectedBoardLength: 0,
    addedLines: "",
    removedLines: "",
  }),
});

export const useSavedConfigStore = defineStore("savedConfig", {
  state: () => ({
    rangeRaw: [
      Float32Array.from({ length: (52 * 51) / 2 }, () => 0),
      Float32Array.from({ length: (52 * 51) / 2 }, () => 0),
    ],
    board: [] as number[],
    startingPot: 0,
    effectiveStack: 0,
    rakePercent: 0,
    rakeCap: 0,
    donkOption: false,
    oopFlopBet: "",
    oopFlopRaise: "",
    oopTurnBet: "",
    oopTurnRaise: "",
    oopTurnDonk: "",
    oopRiverBet: "",
    oopRiverRaise: "",
    oopRiverDonk: "",
    ipFlopBet: "",
    ipFlopRaise: "",
    ipTurnBet: "",
    ipTurnRaise: "",
    ipRiverBet: "",
    ipRiverRaise: "",
    addAllInThreshold: 0,
    forceAllInThreshold: 0,
    mergingThreshold: 0,
    expectedBoardLength: 0,
    addedLines: "",
    removedLines: "",
  }),
});
