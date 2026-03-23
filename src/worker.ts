import * as Comlink from "comlink";
import { detect } from "detect-browser";

type ModST = typeof import("../pkg/solver-st/solver.js");
type ModMT = typeof import("../pkg/solver-mt/solver.js");
type Mod = ModST | ModMT;

export type WorkerInitInfo = {
  requestedThreads: number;
  actualThreads: number;
  mode: "single-thread" | "multi-thread";
  usedFallback: boolean;
  reason: string | null;
  sharedThreadsSupported: boolean;
};

const createHandler = (mod: Mod) => {
  const game = mod.GameManager.new();

  return {
    init(
      oopRange: Float32Array,
      ipRange: Float32Array,
      flop: Uint8Array,
      startingPot: number,
      effectiveStack: number,
      rakePercentage: number,
      rakeCap: number,
      donkOption: boolean,
      oopFlopBet: string,
      oopFlopRaise: string,
      oopTurnBet: string,
      oopTurnRaise: string,
      oopTurnDonk: string,
      oopRiverBet: string,
      oopRiverRaise: string,
      oopRiverDonk: string,
      ipFlopBet: string,
      ipFlopRaise: string,
      ipTurnBet: string,
      ipTurnRaise: string,
      ipRiverBet: string,
      ipRiverRaise: string,
      addAllInThreshold: number,
      forceAllInThreshold: number,
      mergingThreshold: number,
      addedLines: string,
      removedLines: string
    ) {
      return game.init(
        oopRange,
        ipRange,
        flop,
        startingPot,
        effectiveStack,
        rakePercentage,
        rakeCap,
        donkOption,
        oopFlopBet,
        oopFlopRaise,
        oopTurnBet,
        oopTurnRaise,
        oopTurnDonk,
        oopRiverBet,
        oopRiverRaise,
        oopRiverDonk,
        ipFlopBet,
        ipFlopRaise,
        ipTurnBet,
        ipTurnRaise,
        ipRiverBet,
        ipRiverRaise,
        addAllInThreshold,
        forceAllInThreshold,
        mergingThreshold,
        addedLines,
        removedLines
      );
    },

    privateCards(player: number) {
      return game.private_cards(player);
    },

    memoryUsage(enableCompression: boolean) {
      return Number(game.memory_usage(enableCompression));
    },

    allocateMemory(enableCompression: boolean) {
      game.allocate_memory(enableCompression);
    },

    iterate(iteration: number) {
      game.solve_step(iteration);
    },

    exploitability() {
      return game.exploitability();
    },

    finalize() {
      return game.finalize();
    },

    applyHistory(history: Uint32Array) {
      game.apply_history(history);
    },

    totalBetAmount(append: Uint32Array) {
      return game.total_bet_amount(append);
    },

    currentPlayer() {
      return game.current_player() as "oop" | "ip" | "chance" | "terminal";
    },

    numActions() {
      return game.num_actions();
    },

    actionsAfter(append: Uint32Array) {
      return game.actions_after(append);
    },

    possibleCards() {
      return game.possible_cards();
    },

    getResults() {
      return game.get_results();
    },

    getChanceReports(append: Uint32Array, numActions: number) {
      return game.get_chance_reports(append, numActions);
    },
  };
};

const isMTSupported = () => {
  const browser = detect();
  const browserSupportsThreads = !(
    browser && (browser.name === "safari" || browser.os === "iOS")
  );
  const runtimeSupportsSharedMemory =
    typeof SharedArrayBuffer !== "undefined" &&
    globalThis.crossOriginIsolated === true;

  return browserSupportsThreads && runtimeSupportsSharedMemory;
};

let mod: Mod | null = null;
let lastInitInfo: WorkerInitInfo | null = null;
export type Handler = ReturnType<typeof createHandler>;

const loadSingleThreadModule = async () => {
  const st = await import("../pkg/solver-st/solver.js");
  await st.default();
  mod = st;
};

const loadMultiThreadModule = async (numThreads: number) => {
  const mt = await import("../pkg/solver-mt/solver.js");
  await mt.default();
  await mt.initThreadPool(numThreads);
  mod = mt;
};

const initHandler = async (num_threads: number) => {
  const sharedThreadsSupported = isMTSupported();

  if (num_threads > 1 && isMTSupported()) {
    try {
      await loadMultiThreadModule(num_threads);
      lastInitInfo = {
        requestedThreads: num_threads,
        actualThreads: num_threads,
        mode: "multi-thread",
        usedFallback: false,
        reason: null,
        sharedThreadsSupported,
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.warn(
        `Falling back to single-thread solver after multithread initialization failed: ${reason}`
      );
      await loadSingleThreadModule();
      lastInitInfo = {
        requestedThreads: num_threads,
        actualThreads: 1,
        mode: "single-thread",
        usedFallback: true,
        reason,
        sharedThreadsSupported,
      };
    }
  } else {
    await loadSingleThreadModule();
    lastInitInfo = {
      requestedThreads: num_threads,
      actualThreads: 1,
      mode: "single-thread",
      usedFallback: num_threads > 1,
      reason:
        num_threads > 1 && !sharedThreadsSupported
          ? "Multithread WebAssembly is not supported in this browser/runtime."
          : null,
      sharedThreadsSupported,
    };
  }

  if (!mod) {
    throw new Error("Solver module failed to initialize");
  }

  return Comlink.proxy(createHandler(mod));
};

const getInitInfo = () => lastInitInfo;

const beforeTerminate = async () => {
  if (mod && "exitThreadPool" in mod) {
    await (mod as ModMT).exitThreadPool();
  }
};

export interface WorkerApi {
  initHandler: typeof initHandler;
  getInitInfo: typeof getInitInfo;
  beforeTerminate: typeof beforeTerminate;
}

Comlink.expose({ initHandler, getInitInfo, beforeTerminate });
