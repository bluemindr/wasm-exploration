// @ts-ignore Generated after `npm run wasm`.
import { RangeManager } from "../../pkg/range/range";
import { parseCardString } from "../utils";
import { useConfigStore } from "../store";
import type { SolverConfigSnapshot } from "./research-solver";

export type ResearchPresetId =
  | "btn-vs-bb-srp"
  | "co-vs-bb-srp"
  | "utg-vs-bb-srp"
  | "bb-vs-btn-3bet"
  | "sb-vs-btn-3bet"
  | "sb-vs-co-3bet"
  | "sb-vs-utg-3bet";

export type ResearchPreset = {
  id: ResearchPresetId;
  label: string;
  summary: string;
  note: string;
  oopRangeText: string;
  ipRangeText: string;
  startingPot: number;
  effectiveStack: number;
  rakePercent: number;
  rakeCap: number;
  oopFlopBet: string;
  oopFlopRaise: string;
  oopTurnBet: string;
  oopTurnRaise: string;
  oopRiverBet: string;
  oopRiverRaise: string;
  ipFlopBet: string;
  ipFlopRaise: string;
  ipTurnBet: string;
  ipTurnRaise: string;
  ipRiverBet: string;
  ipRiverRaise: string;
  addAllInThreshold: number;
  forceAllInThreshold: number;
  mergingThreshold: number;
  referenceBoard: string;
};

export type FlopStudyItem = {
  id: string;
  boardText: string;
  label: string;
  category: string;
  weight: number;
  note: string;
  flopBetOverride?: string;
};

export const researchPresets: ResearchPreset[] = [
  {
    id: "btn-vs-bb-srp",
    label: "BTN vs BB SRP",
    summary: "Single-raised pot, BB OOP, no ante, deep stack typique.",
    note:
      "Preset volontairement editable et 'GTO-ish' plutot que dogmatique: le but est de fournir une base de travail cohérente pour l'étude multi-flops.",
    oopRangeText:
      "22+,A2s+,K2s+,Q4s+,J6s+,T6s+,96s+,86s+,75s+,64s+,53s+,43s,A2o+,K5o+,Q8o+,J8o+,T8o+,98o,87o",
    ipRangeText:
      "22+,A2s+,K2s+,Q5s+,J7s+,T7s+,97s+,86s+,75s+,64s+,53s+,43s,A2o+,K7o+,Q9o+,J9o+,T9o",
    startingPot: 65,
    effectiveStack: 970,
    rakePercent: 5,
    rakeCap: 30,
    oopFlopBet: "33, 50",
    oopFlopRaise: "70, a",
    oopTurnBet: "50, 100",
    oopTurnRaise: "70, a",
    oopRiverBet: "50",
    oopRiverRaise: "70, a",
    ipFlopBet: "33, 50",
    ipFlopRaise: "70, a",
    ipTurnBet: "50, 100",
    ipTurnRaise: "70, a",
    ipRiverBet: "50",
    ipRiverRaise: "70, a",
    addAllInThreshold: 150,
    forceAllInThreshold: 20,
    mergingThreshold: 10,
    referenceBoard: "Ah7d2c",
  },
  {
    id: "co-vs-bb-srp",
    label: "CO vs BB SRP",
    summary: "Single-raised pot, BB OOP contre open CO, profondeur standard sans ante.",
    note:
      "Range d'open CO un peu plus serrée que BTN, avec toujours l'arbre deep stack 33/50 flop, 50/100 turn, 50 river.",
    oopRangeText:
      "22+,A2s+,K3s+,Q6s+,J7s+,T7s+,97s+,87s,76s,65s,54s,A2o+,K7o+,Q9o+,J9o+,T9o,98o",
    ipRangeText:
      "22+,A2s+,K5s+,Q7s+,J8s+,T8s+,98s,87s,76s,65s,A7o+,ATo+,KTo+,QTo+,JTo",
    startingPot: 65,
    effectiveStack: 970,
    rakePercent: 5,
    rakeCap: 30,
    oopFlopBet: "33, 50",
    oopFlopRaise: "70, a",
    oopTurnBet: "50, 100",
    oopTurnRaise: "70, a",
    oopRiverBet: "50",
    oopRiverRaise: "70, a",
    ipFlopBet: "33, 50",
    ipFlopRaise: "70, a",
    ipTurnBet: "50, 100",
    ipTurnRaise: "70, a",
    ipRiverBet: "50",
    ipRiverRaise: "70, a",
    addAllInThreshold: 150,
    forceAllInThreshold: 20,
    mergingThreshold: 10,
    referenceBoard: "Kh8d3c",
  },
  {
    id: "utg-vs-bb-srp",
    label: "UTG 6max vs BB SRP",
    summary: "Single-raised pot, BB OOP contre open UTG 6-max, ranges resserrées.",
    note:
      "Preset UTG 6-max plus tight, utile pour voir comment l'avantage de range change sur les A-high et K-high boards en SRP.",
    oopRangeText:
      "22+,A2s+,K5s+,Q8s+,J8s+,T8s+,98s,87s,76s,65s,A7o+,A9o+,KTo+,QTo+,JTo",
    ipRangeText:
      "44+,A2s+,KTs+,QTs+,JTs,T9s,98s,AJo+,KQo",
    startingPot: 65,
    effectiveStack: 970,
    rakePercent: 5,
    rakeCap: 30,
    oopFlopBet: "33, 50",
    oopFlopRaise: "70, a",
    oopTurnBet: "50, 100",
    oopTurnRaise: "70, a",
    oopRiverBet: "50",
    oopRiverRaise: "70, a",
    ipFlopBet: "33, 50",
    ipFlopRaise: "70, a",
    ipTurnBet: "50, 100",
    ipTurnRaise: "70, a",
    ipRiverBet: "50",
    ipRiverRaise: "70, a",
    addAllInThreshold: 150,
    forceAllInThreshold: 20,
    mergingThreshold: 10,
    referenceBoard: "AcKd3h",
  },
  {
    id: "bb-vs-btn-3bet",
    label: "BB vs BTN 3bet Pot",
    summary: "3bet pot OOP, SPR plus faible, ranges resserrées.",
    note:
      "Baseline plus proche d'un profil GTO moderne: 3bet BB nettement moins loose et range de call BTN davantage structurée autour des pocket pairs, broadways suited et connecteurs IP.",
    oopRangeText:
      "88,99,TT,JJ,QQ,KK,AA,A4s,A5s,ATs,AJs,AQs,AKs,KTs,KJs,KQs,QTs,QJs,JTs,T9s,98s,AQo,AKo,KQo",
    ipRangeText:
      "22,33,44,55,66,77,88,99,TT,JJ,A2s,A3s,A4s,A5s,AJs,AQs,K9s,KTs,KJs,KQs,Q9s,QTs,QJs,J9s,JTs,T8s,T9s,97s,98s,87s,76s,65s,AJo,AQo,KQo",
    startingPot: 210,
    effectiveStack: 900,
    rakePercent: 4,
    rakeCap: 20,
    oopFlopBet: "33, 50",
    oopFlopRaise: "70, a",
    oopTurnBet: "50",
    oopTurnRaise: "70, a",
    oopRiverBet: "50, 100",
    oopRiverRaise: "70, a",
    ipFlopBet: "33, 50",
    ipFlopRaise: "70, a",
    ipTurnBet: "50",
    ipTurnRaise: "70, a",
    ipRiverBet: "50, 100",
    ipRiverRaise: "70, a",
    addAllInThreshold: 120,
    forceAllInThreshold: 20,
    mergingThreshold: 10,
    referenceBoard: "As8d3d",
  },
  {
    id: "sb-vs-btn-3bet",
    label: "SB vs BTN 3bet Pot",
    summary: "3bet pot, SB OOP après open BTN / 3bet SB / call BTN.",
    note:
      "Version plus crédible du duel SB vs BTN: 3bet SB moins excessif hors de position, et call BTN plus discipliné malgré l'avantage de position.",
    oopRangeText:
      "88,99,TT,JJ,QQ,KK,AA,A4s,A5s,ATs,AJs,AQs,AKs,KTs,KJs,KQs,QTs,QJs,JTs,T9s,98s,AQo,AKo,KQo",
    ipRangeText:
      "22,33,44,55,66,77,88,99,TT,JJ,A2s,A3s,A4s,A5s,AJs,AQs,KTs,KJs,KQs,Q9s,QTs,QJs,J9s,JTs,T8s,T9s,98s,87s,76s,AJo,AQo,KQo",
    startingPot: 200,
    effectiveStack: 900,
    rakePercent: 4,
    rakeCap: 20,
    oopFlopBet: "33, 50",
    oopFlopRaise: "70, a",
    oopTurnBet: "50",
    oopTurnRaise: "70, a",
    oopRiverBet: "50, 100",
    oopRiverRaise: "70, a",
    ipFlopBet: "33, 50",
    ipFlopRaise: "70, a",
    ipTurnBet: "50",
    ipTurnRaise: "70, a",
    ipRiverBet: "50, 100",
    ipRiverRaise: "70, a",
    addAllInThreshold: 120,
    forceAllInThreshold: 20,
    mergingThreshold: 10,
    referenceBoard: "Kh8d3c",
  },
  {
    id: "sb-vs-co-3bet",
    label: "SB vs CO 3bet Pot",
    summary: "3bet pot, SB OOP après open CO / 3bet SB / call CO.",
    note:
      "CO défend plus tight que BTN, avec moins de suited trash et une composante broadway/pocket pair plus marquée dans le call IP.",
    oopRangeText:
      "99,TT,JJ,QQ,KK,AA,A4s,A5s,AJs,AQs,AKs,KTs,KJs,KQs,QTs,QJs,JTs,T9s,AQo,AKo,KQo",
    ipRangeText:
      "44,55,66,77,88,99,TT,JJ,A5s,ATs,AJs,AQs,KTs,KJs,KQs,QTs,QJs,JTs,T9s,98s,87s,AQo,KQo",
    startingPot: 200,
    effectiveStack: 900,
    rakePercent: 4,
    rakeCap: 20,
    oopFlopBet: "33, 50",
    oopFlopRaise: "70, a",
    oopTurnBet: "50",
    oopTurnRaise: "70, a",
    oopRiverBet: "50, 100",
    oopRiverRaise: "70, a",
    ipFlopBet: "33, 50",
    ipFlopRaise: "70, a",
    ipTurnBet: "50",
    ipTurnRaise: "70, a",
    ipRiverBet: "50, 100",
    ipRiverRaise: "70, a",
    addAllInThreshold: 120,
    forceAllInThreshold: 20,
    mergingThreshold: 10,
    referenceBoard: "AcKd3h",
  },
  {
    id: "sb-vs-utg-3bet",
    label: "SB vs UTG 6max 3bet Pot",
    summary: "3bet pot, SB OOP après open UTG 6-max / 3bet SB / call UTG.",
    note:
      "Version volontairement tight et polarisée, plus compatible avec des tendances GTO UTG vs SB: peu de suited faibles, call UTG surtout centré sur les pockets intermédiaires et les broadways forts.",
    oopRangeText:
      "TT,JJ,QQ,KK,AA,A4s,A5s,AQs,AKs,KQs,AKo",
    ipRangeText:
      "88,99,TT,JJ,QQ,AJs,AQs,KQs,QJs,JTs,T9s,AQo",
    startingPot: 200,
    effectiveStack: 900,
    rakePercent: 4,
    rakeCap: 20,
    oopFlopBet: "33, 50",
    oopFlopRaise: "70, a",
    oopTurnBet: "50",
    oopTurnRaise: "70, a",
    oopRiverBet: "50, 100",
    oopRiverRaise: "70, a",
    ipFlopBet: "33, 50",
    ipFlopRaise: "70, a",
    ipTurnBet: "50",
    ipTurnRaise: "70, a",
    ipRiverBet: "50, 100",
    ipRiverRaise: "70, a",
    addAllInThreshold: 120,
    forceAllInThreshold: 20,
    mergingThreshold: 10,
    referenceBoard: "As8s3d",
  },
];

export const representativeFlops: FlopStudyItem[] = [
  {
    id: "a72r",
    boardText: "Ah7d2c",
    label: "A72r",
    category: "A-high dry",
    weight: 1,
    note: "Prototype des boards A-high rainbow très secs où la simplification de range bet est fréquente.",
  },
  {
    id: "a83tt",
    boardText: "As8s3d",
    label: "A83tt",
    category: "A-high two-tone",
    weight: 1,
    note: "Capture l'effet des backdoors et des flush draws sur les textures A-high les plus fréquentes.",
  },
  {
    id: "ak3r",
    boardText: "AcKd3h",
    label: "AK3r",
    category: "Broadway high",
    weight: 0.9,
    note: "Board high card très asymétrique avec forte pression d'avantage de range, bon candidat à l'overbet flop.",
    flopBetOverride: "33, 50, 200",
  },
  {
    id: "a54tt",
    boardText: "Ad5d4s",
    label: "A54tt",
    category: "A-high dynamic",
    weight: 0.8,
    note: "Texture A-high mais plus connectée, utile pour contraster avec les A-high secs.",
  },
  {
    id: "k83r",
    boardText: "Kh8d3c",
    label: "K83r",
    category: "K-high dry",
    weight: 0.9,
    note: "Archétype K-high sec où l'overbet flop mérite d'être testé explicitement.",
    flopBetOverride: "33, 50, 200",
  },
  {
    id: "k72tt",
    boardText: "Kh7h2d",
    label: "K72tt",
    category: "K-high two-tone",
    weight: 0.7,
    note: "Version two-tone du K-high utile pour comparer l'effet des flush draws sur la simplification de c-bet.",
  },
  {
    id: "kq3r",
    boardText: "KsQc3d",
    label: "KQ3r",
    category: "Broadway high",
    weight: 0.8,
    note: "Board broadway sec où les stratégies small bet et check-back polarisé s'opposent souvent.",
  },
  {
    id: "kj9tt",
    boardText: "KdJh9h",
    label: "KJ9tt",
    category: "Broadway dynamic",
    weight: 0.7,
    note: "Très utile pour observer comment la connectivité réduit la simplification high-card.",
  },
  {
    id: "q76tt",
    boardText: "Qh7h6d",
    label: "Q76tt",
    category: "Middle dynamic",
    weight: 0.7,
    note: "Board intermédiaire avec tirages nombreux et avantages de nut plus partagés.",
  },
  {
    id: "j86r",
    boardText: "Js8d6c",
    label: "J86r",
    category: "Middle connected",
    weight: 0.6,
    note: "Intermédiaire rainbow, souvent bon test pour voir si la stratégie s'équilibre entre bet et check.",
  },
  {
    id: "t95tt",
    boardText: "Th9h5d",
    label: "T95tt",
    category: "Low dynamic",
    weight: 0.6,
    note: "Texture dynamique basse où les ranges de défense conservent beaucoup d'équité réelle.",
  },
  {
    id: "987r",
    boardText: "9h8d7c",
    label: "987r",
    category: "Very connected",
    weight: 0.5,
    note: "Board très connecté, utile pour opposer à la simplification des high-card boards.",
  },
  {
    id: "765r",
    boardText: "7h6d5c",
    label: "765r",
    category: "Very connected",
    weight: 0.4,
    note: "Moins fréquent comme archétype représentatif, mais nécessaire comme point d'ancrage pour les boards bas et connectés.",
  },
  {
    id: "842r",
    boardText: "8h4d2c",
    label: "842r",
    category: "Low dry",
    weight: 0.6,
    note: "Board bas et sec pour comparer aux low connected et aux monotones.",
  },
  {
    id: "632tt",
    boardText: "6h3h2d",
    label: "632tt",
    category: "Low wheel",
    weight: 0.5,
    note: "Archetype low wheel avec interaction forte sur les petits tirages et les wheel draws.",
  },
  {
    id: "q84m",
    boardText: "Qs8s4s",
    label: "Q84m",
    category: "Monotone disconnected",
    weight: 0.5,
    note: "Monotone non As, volontairement choisi pour tester la simplification attendue des c-bets de range.",
  },
  {
    id: "964m",
    boardText: "9h6h4h",
    label: "964m",
    category: "Monotone middling",
    weight: 0.4,
    note: "Monotone plus connecté pour vérifier à quel point la simplification monotone tient quand la structure s'anime.",
  },
];

const parseBoardText = (boardText: string): number[] => {
  const normalized = boardText.trim();
  const tokens = /[\s,]/.test(normalized)
    ? normalized.split(/[\,\s]+/).map((item) => item.trim())
    : normalized.match(/.{1,2}/g) ?? [];

  const board = tokens
    .filter(Boolean)
    .map(parseCardString)
    .filter((card): card is number => card !== null);

  return board;
};

const setRange = (
  config: ReturnType<typeof useConfigStore>,
  player: 0 | 1,
  rangeText: string
) => {
  const manager = RangeManager.new();
  const error = manager.from_string(rangeText);

  if (error) {
    throw new Error(error);
  }

  const weights = Array.from(manager.get_weights() as ArrayLike<number>, (value) =>
    value * 100
  );
  config.range[player].splice(0, config.range[player].length, ...weights);
  config.rangeRaw[player].set(manager.raw_data());
};

const buildRangeRaw = (rangeText: string) => {
  const manager = RangeManager.new();
  const error = manager.from_string(rangeText);

  if (error) {
    throw new Error(error);
  }

  return Float32Array.from(manager.raw_data() as ArrayLike<number>);
};

export const getResearchPresetById = (presetId: ResearchPresetId) => {
  const preset = researchPresets.find((candidate) => candidate.id === presetId);

  if (!preset) {
    throw new Error(`Unknown research preset: ${presetId}`);
  }

  return preset;
};

export const createResearchPresetSnapshot = (
  presetId: ResearchPresetId,
  boardOverride?: number[],
  treeOverrides?: { oopFlopBet?: string; ipFlopBet?: string }
): SolverConfigSnapshot => {
  const preset = getResearchPresetById(presetId);

  return {
    rangeRaw: [buildRangeRaw(preset.oopRangeText), buildRangeRaw(preset.ipRangeText)],
    board: [...(boardOverride ?? parseBoardText(preset.referenceBoard))],
    startingPot: preset.startingPot,
    effectiveStack: preset.effectiveStack,
    rakePercent: preset.rakePercent,
    rakeCap: preset.rakeCap,
    donkOption: false,
    oopFlopBet: treeOverrides?.oopFlopBet ?? preset.oopFlopBet,
    oopFlopRaise: preset.oopFlopRaise,
    oopTurnBet: preset.oopTurnBet,
    oopTurnRaise: preset.oopTurnRaise,
    oopTurnDonk: "",
    oopRiverBet: preset.oopRiverBet,
    oopRiverRaise: preset.oopRiverRaise,
    oopRiverDonk: "",
    ipFlopBet: treeOverrides?.ipFlopBet ?? preset.ipFlopBet,
    ipFlopRaise: preset.ipFlopRaise,
    ipTurnBet: preset.ipTurnBet,
    ipTurnRaise: preset.ipTurnRaise,
    ipRiverBet: preset.ipRiverBet,
    ipRiverRaise: preset.ipRiverRaise,
    addAllInThreshold: preset.addAllInThreshold,
    forceAllInThreshold: preset.forceAllInThreshold,
    mergingThreshold: preset.mergingThreshold,
    addedLines: "",
    removedLines: "",
  };
};

export const applyResearchPreset = (
  config: ReturnType<typeof useConfigStore>,
  preset: ResearchPreset
) => {
  setRange(config, 0, preset.oopRangeText);
  setRange(config, 1, preset.ipRangeText);

  config.board = parseBoardText(preset.referenceBoard);
  config.startingPot = preset.startingPot;
  config.effectiveStack = preset.effectiveStack;
  config.rakePercent = preset.rakePercent;
  config.rakeCap = preset.rakeCap;
  config.donkOption = false;
  config.oopFlopBet = preset.oopFlopBet;
  config.oopFlopRaise = preset.oopFlopRaise;
  config.oopTurnBet = preset.oopTurnBet;
  config.oopTurnRaise = preset.oopTurnRaise;
  config.oopTurnDonk = "";
  config.oopRiverBet = preset.oopRiverBet;
  config.oopRiverRaise = preset.oopRiverRaise;
  config.oopRiverDonk = "";
  config.ipFlopBet = preset.ipFlopBet;
  config.ipFlopRaise = preset.ipFlopRaise;
  config.ipTurnBet = preset.ipTurnBet;
  config.ipTurnRaise = preset.ipTurnRaise;
  config.ipRiverBet = preset.ipRiverBet;
  config.ipRiverRaise = preset.ipRiverRaise;
  config.addAllInThreshold = preset.addAllInThreshold;
  config.forceAllInThreshold = preset.forceAllInThreshold;
  config.mergingThreshold = preset.mergingThreshold;
  config.expectedBoardLength = 0;
  config.addedLines = "";
  config.removedLines = "";
};

export const parseStudyBoard = (boardText: string) => parseBoardText(boardText);
