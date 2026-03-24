// @ts-ignore Generated after `npm run wasm`.
import { RangeManager } from "../../pkg/range/range";
import { parseCardString } from "../utils";
import { useConfigStore } from "../store";
import type { SolverConfigSnapshot } from "./research-solver";

export type ResearchPresetId =
  | "btn-vs-bb-srp"
  | "co-vs-bb-srp"
  | "utg-vs-bb-srp"
  | "co-vs-btn-3bet"
  | "bb-vs-btn-3bet"
  | "sb-vs-btn-3bet"
  | "sb-vs-co-3bet"
  | "sb-vs-utg-3bet";

export const isSingleRaisedPotResearchPreset = (presetId: ResearchPresetId) =>
  presetId === "btn-vs-bb-srp" ||
  presetId === "co-vs-bb-srp" ||
  presetId === "utg-vs-bb-srp";

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
    summary: "Single-raised pot 100BB, open BTN 3BB, BB defend OOP, sans ante.",
    note:
      "Approximation GTO ouverte pour cash game 100BB avec open 3x. Le pot flop vaut 65 et le stack effectif restant 970.",
    oopRangeText:
      "77-22,A3s-A2s,A9s-A6s,K9s-K4s,Q9s-Q7s,J9s-J7s,T8s-T7s,97s+,86s+,76s,65s,54s,43s,AJo-A5o,KJo-K9o,Q9o+,J9o+,T9o,98o,87o",
    ipRangeText:
      "22+,A2s+,K2s+,Q5s+,J7s+,T7s+,97s+,86s+,75s+,64s+,53s+,43s,A2o+,K7o+,Q9o+,J9o+,T9o",
    startingPot: 65,
    effectiveStack: 970,
    rakePercent: 5,
    rakeCap: 30,
    oopFlopBet: "33",
    oopFlopRaise: "70, a",
    oopTurnBet: "50, 200",
    oopTurnRaise: "70, a",
    oopRiverBet: "50",
    oopRiverRaise: "70, a",
    ipFlopBet: "50, 200",
    ipFlopRaise: "70, a",
    ipTurnBet: "50, 100, 200",
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
    summary: "Single-raised pot 100BB, open CO 3BB, BB defend OOP, sans ante.",
    note:
      "Approximation GTO ouverte pour cash game 100BB avec open CO 3x. Le pot flop vaut 65 et le stack effectif restant 970.",
    oopRangeText:
      "88-22,A3s-A2s,ATs-A6s,K9s-K5s,Q9s-Q8s,J9s-J8s,T8s,97s+,87s,76s,65s,54s,AJo-A7o,KJo-KTo,QTo+,JTo,98o",
    ipRangeText:
      "22+,A2s+,K5s+,Q7s+,J8s+,T8s+,98s,87s,76s,65s,54s,A8o+,ATo+,KTo+,QTo+,JTo",
    startingPot: 65,
    effectiveStack: 970,
    rakePercent: 5,
    rakeCap: 30,
    oopFlopBet: "33",
    oopFlopRaise: "70, a",
    oopTurnBet: "50, 200",
    oopTurnRaise: "70, a",
    oopRiverBet: "50",
    oopRiverRaise: "70, a",
    ipFlopBet: "50, 200",
    ipFlopRaise: "70, a",
    ipTurnBet: "50, 100, 200",
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
    summary: "Single-raised pot 100BB, open UTG 3BB, BB defend OOP, sans ante.",
    note:
      "Approximation GTO ouverte pour cash game 100BB avec open UTG 3x. Le pot flop vaut 65 et le stack effectif restant 970.",
    oopRangeText:
      "99-22,A3s-A2s,AJs-A6s,KJs-K7s,Q9s+,J9s+,T8s+,98s,87s,76s,65s,AQo-A9o,KJo+,QJo",
    ipRangeText:
      "55+,A2s+,ATs+,KTs+,QTs+,JTs,T9s,98s,AQo+,AJo,KQo",
    startingPot: 65,
    effectiveStack: 970,
    rakePercent: 5,
    rakeCap: 30,
    oopFlopBet: "33",
    oopFlopRaise: "70, a",
    oopTurnBet: "50, 200",
    oopTurnRaise: "70, a",
    oopRiverBet: "50",
    oopRiverRaise: "70, a",
    ipFlopBet: "50, 200",
    ipFlopRaise: "70, a",
    ipTurnBet: "50, 100, 200",
    ipTurnRaise: "70, a",
    ipRiverBet: "50",
    ipRiverRaise: "70, a",
    addAllInThreshold: 150,
    forceAllInThreshold: 20,
    mergingThreshold: 10,
    referenceBoard: "AcKd3h",
  },
  {
    id: "co-vs-btn-3bet",
    label: "CO vs BTN 3bet Pot",
    summary: "3bet pot 100BB, BTN 3bet IP à 9BB vs open CO 3BB.",
    note:
      "Approximation GTO ouverte pour cash game 100BB avec 3bet IP à 9BB total. Le pot flop vaut 195 et le stack effectif restant 910.",
    oopRangeText:
      "77,88,99,TT,JJ,QQ,AJs,AQs,AKs,KQs,QJs,JTs,T9s,98s,AQo,AKo",
    ipRangeText:
      "99,TT,JJ,QQ,KK,AA,A5s,A4s,ATs,AJs,AQs,AKs,KTs,KJs,KQs,QTs,QJs,JTs,T9s,98s,AQo,AKo,KQo",
    startingPot: 195,
    effectiveStack: 910,
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
    id: "bb-vs-btn-3bet",
    label: "BB vs BTN 3bet Pot",
    summary: "3bet pot 100BB, BB 3bet OOP à 12BB vs open BTN 3BB.",
    note:
      "Approximation GTO ouverte pour cash game 100BB avec 3bet OOP à 12x. Le pot flop vaut 245 et le stack effectif restant 880.",
    oopRangeText:
      "88,99,TT,JJ,QQ,KK,AA,A5s,A4s,ATs,AJs,AQs,AKs,KTs,KJs,KQs,QTs,QJs,JTs,T9s,98s,AQo,AKo,KQo",
    ipRangeText:
      "44,55,66,77,88,99,TT,JJ,AJs,AQs,KTs,KJs,KQs,QTs,QJs,JTs,T9s,98s,87s,AQo,KQo",
    startingPot: 245,
    effectiveStack: 880,
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
    summary: "3bet pot 100BB, SB 3bet OOP à 12BB vs open BTN 3BB.",
    note:
      "Approximation GTO ouverte pour cash game 100BB avec 3bet OOP à 12BB total, blinde incluse. Le pot flop vaut 250 et le stack effectif restant 880.",
    oopRangeText:
      "99,TT,JJ,QQ,KK,AA,A5s,A4s,ATs,AJs,AQs,AKs,KTs,KJs,KQs,QTs,QJs,JTs,T9s,98s,AQo,AKo,KQo",
    ipRangeText:
      "55,66,77,88,99,TT,JJ,AJs,AQs,KTs,KJs,KQs,QTs,QJs,JTs,T9s,98s,AQo,KQo",
    startingPot: 250,
    effectiveStack: 880,
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
    summary: "3bet pot 100BB, SB 3bet OOP à 12BB vs open CO 3BB.",
    note:
      "Approximation GTO ouverte pour cash game 100BB avec 3bet OOP à 12BB total, blinde incluse. Le pot flop vaut 250 et le stack effectif restant 880.",
    oopRangeText:
      "99,TT,JJ,QQ,KK,AA,A5s,A4s,AJs,AQs,AKs,KTs,KJs,KQs,QTs,QJs,JTs,T9s,AQo,AKo,KQo",
    ipRangeText:
      "66,77,88,99,TT,JJ,AJs,AQs,KQs,QJs,JTs,T9s,98s,AQo,KQo",
    startingPot: 250,
    effectiveStack: 880,
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
    summary: "3bet pot 100BB, SB 3bet OOP à 12BB vs open UTG 3BB.",
    note:
      "Approximation GTO ouverte pour cash game 100BB avec 3bet OOP à 12BB total, blinde incluse. Le pot flop vaut 250 et le stack effectif restant 880.",
    oopRangeText:
      "TT,JJ,QQ,KK,AA,A4s,A5s,AQs,AKs,KQs,AKo",
    ipRangeText:
      "88,99,TT,JJ,QQ,AQs,AJs,KQs,QJs,JTs,AQo,KQo",
    startingPot: 250,
    effectiveStack: 880,
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

// Heuristic aggregation weights for study importance, not exact combinatorial frequencies.
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
    weight: 0.95,
    note: "Capture l'effet des backdoors et des flush draws sur les textures A-high les plus fréquentes.",
  },
  {
    id: "ak3r",
    boardText: "AcKd3h",
    label: "AK3r",
    category: "Broadway high",
    weight: 0.85,
    note: "Board high card très asymétrique avec forte pression d'avantage de range, bon candidat à l'overbet flop.",
    flopBetOverride: "33, 200",
  },
  {
    id: "a54tt",
    boardText: "Ad5d4s",
    label: "A54tt",
    category: "A-high dynamic",
    weight: 0.65,
    note: "Texture A-high mais plus connectée, utile pour contraster avec les A-high secs.",
  },
  {
    id: "at6tt",
    boardText: "AsTd6d",
    label: "AT6tt",
    category: "A-high broadway",
    weight: 0.75,
    note: "Très bon représentant des A-high two-tone avec broadway haute et carte moyenne, où la range de c-bet reste forte mais moins triviale que sur A72.",
  },
  {
    id: "k83r",
    boardText: "Kh8d3c",
    label: "K83r",
    category: "K-high dry",
    weight: 0.8,
    note: "Archétype K-high sec où l'overbet flop mérite d'être testé explicitement.",
    flopBetOverride: "33, 200",
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
    id: "k96tt",
    boardText: "Kh9h6d",
    label: "K96tt",
    category: "K-high dynamic",
    weight: 0.65,
    note: "Texture K-high two-tone plus vivante que K72, utile pour observer l'impact combiné des tirages couleur et des straight draws intermédiaires.",
  },
  {
    id: "kq3r",
    boardText: "KsQc3d",
    label: "KQ3r",
    category: "Broadway high",
    weight: 0.7,
    note: "Board broadway sec où les stratégies small bet et check-back polarisé s'opposent souvent.",
  },
  {
    id: "kj9tt",
    boardText: "KdJh9h",
    label: "KJ9tt",
    category: "Broadway dynamic",
    weight: 0.55,
    note: "Très utile pour observer comment la connectivité réduit la simplification high-card.",
  },
  {
    id: "q76tt",
    boardText: "Qh7h6d",
    label: "Q76tt",
    category: "Middle dynamic",
    weight: 0.5,
    note: "Board intermédiaire avec tirages nombreux et avantages de nut plus partagés.",
  },
  {
    id: "j86r",
    boardText: "Js8d6c",
    label: "J86r",
    category: "Middle connected",
    weight: 0.45,
    note: "Intermédiaire rainbow, souvent bon test pour voir si la stratégie s'équilibre entre bet et check.",
  },
  {
    id: "t95tt",
    boardText: "Th9h5d",
    label: "T95tt",
    category: "Low dynamic",
    weight: 0.4,
    note: "Texture dynamique basse où les ranges de défense conservent beaucoup d'équité réelle.",
  },
  {
    id: "987r",
    boardText: "9h8d7c",
    label: "987r",
    category: "Very connected",
    weight: 0.35,
    note: "Board très connecté, utile pour opposer à la simplification des high-card boards.",
  },
  {
    id: "765r",
    boardText: "7h6d5c",
    label: "765r",
    category: "Very connected",
    weight: 0.25,
    note: "Moins fréquent comme archétype représentatif, mais nécessaire comme point d'ancrage pour les boards bas et connectés.",
  },
  {
    id: "842r",
    boardText: "8h4d2c",
    label: "842r",
    category: "Low dry",
    weight: 0.45,
    note: "Board bas et sec pour comparer aux low connected et aux monotones.",
  },
  {
    id: "632tt",
    boardText: "6h3h2d",
    label: "632tt",
    category: "Low wheel",
    weight: 0.3,
    note: "Archetype low wheel avec interaction forte sur les petits tirages et les wheel draws.",
  },
  {
    id: "q84m",
    boardText: "Qs8s4s",
    label: "Q84m",
    category: "Monotone disconnected",
    weight: 0.28,
    note: "Monotone non As, volontairement choisi pour tester la simplification attendue des c-bets de range.",
  },
  {
    id: "964m",
    boardText: "9h6h4h",
    label: "964m",
    category: "Monotone middling",
    weight: 0.22,
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
