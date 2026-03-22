import { useConfigStore } from "../store";
import {
  INVALID_LINE_STRING,
  MAX_AMOUNT,
  ROOT_LINE_STRING,
  readableLineString,
} from "../utils";

export type ConfigStore = ReturnType<typeof useConfigStore>;

type CheckConfigOptions = {
  boardOverride?: number[];
};

export const checkConfig = (
  config: ConfigStore,
  options?: CheckConfigOptions
): string | null => {
  const board = options?.boardOverride ?? config.board;

  if (board.length < 3) {
    return "Board must consist of at least three cards";
  }

  if (config.startingPot <= 0) {
    return "Starting pot must be positive";
  }

  if (config.startingPot > MAX_AMOUNT) {
    return "Starting pot is too large";
  }

  if (config.startingPot % 1 !== 0) {
    return "Starting pot must be an integer";
  }

  if (config.effectiveStack <= 0) {
    return "Effective stack must be positive";
  }

  if (config.effectiveStack > MAX_AMOUNT) {
    return "Effective stack is too large";
  }

  if (config.effectiveStack % 1 !== 0) {
    return "Effective stack is be an integer";
  }

  const betConfig = [
    { s: config.oopFlopBetSanitized, kind: "OOP flop bet" },
    { s: config.oopFlopRaiseSanitized, kind: "OOP flop raise" },
    { s: config.oopTurnBetSanitized, kind: "OOP turn bet" },
    { s: config.oopTurnRaiseSanitized, kind: "OOP turn raise" },
    { s: config.oopRiverBetSanitized, kind: "OOP river bet" },
    { s: config.oopRiverRaiseSanitized, kind: "OOP river raise" },
    { s: config.ipFlopBetSanitized, kind: "IP flop bet" },
    { s: config.ipFlopRaiseSanitized, kind: "IP flop raise" },
    { s: config.ipTurnBetSanitized, kind: "IP turn bet" },
    { s: config.ipTurnRaiseSanitized, kind: "IP turn raise" },
    { s: config.ipRiverBetSanitized, kind: "IP river bet" },
    { s: config.ipRiverRaiseSanitized, kind: "IP river raise" },
  ];

  for (const { s, kind } of betConfig) {
    if (!s.valid) {
      return `${kind}: ${s.s}`;
    }
  }

  if (config.donkOption) {
    if (!config.oopTurnDonkSanitized.valid) {
      return `OOP turn donk: ${config.oopTurnDonkSanitized.s}`;
    }

    if (!config.oopRiverDonkSanitized.valid) {
      return `OOP river donk: ${config.oopRiverDonkSanitized.s}`;
    }
  }

  if (config.addAllInThreshold < 0) {
    return "Invalid add all-in threshold";
  }

  if (config.forceAllInThreshold < 0) {
    return "Invalid force all-in threshold";
  }

  if (config.mergingThreshold < 0) {
    return "Invalid merging threshold";
  }

  if (
    config.expectedBoardLength > 0 &&
    board.length !== config.expectedBoardLength
  ) {
    return `Invalid board (expected ${config.expectedBoardLength} cards)`;
  }

  const addedLinesArray =
    config.addedLines === ""
      ? []
      : config.addedLines.split(",").map(readableLineString);

  const removedLinesArray =
    config.removedLines === ""
      ? []
      : config.removedLines.split(",").map(readableLineString);

  if (
    addedLinesArray.includes(ROOT_LINE_STRING) ||
    addedLinesArray.includes(INVALID_LINE_STRING) ||
    removedLinesArray.includes(ROOT_LINE_STRING) ||
    removedLinesArray.includes(INVALID_LINE_STRING)
  ) {
    return "Invalid line found (loaded broken configurations?)";
  }

  if (
    ![0, 3, 4, 5].includes(config.expectedBoardLength) ||
    (config.expectedBoardLength === 0 &&
      (addedLinesArray.length > 0 || removedLinesArray.length > 0)) ||
    (config.expectedBoardLength > 0 &&
      addedLinesArray.length === 0 &&
      removedLinesArray.length === 0)
  ) {
    return "Invalid configurations (loaded broken configurations?)";
  }

  return null;
};
