declare module "../../pkg/range/range" {
  export class RangeManager {
    static new(): RangeManager;
    clear(): void;
    update(row: number, col: number, weight: number): void;
    from_string(value: string): string | null;
    to_string(): string;
    get_weights(): ArrayLike<number>;
    raw_data(): Float32Array;
  }
}

declare module "../../pkg/tree/tree" {
  export class TreeManager {
    static new(...args: unknown[]): TreeManager;
    is_error(): boolean;
    added_lines(): string;
    removed_lines(): string;
    invalid_terminals(): string;
    actions(): string;
    is_terminal_node(): boolean;
    is_chance_node(): boolean;
    back_to_root(): void;
    apply_history(line: string): void;
    play(action: string): number;
    total_bet_amount(): Int32Array;
    add_bet_action(amount: number, isRaise: boolean): void;
    remove_current_node(): void;
    delete_added_line(line: string): void;
  }
}

declare module "../pkg/solver-st/solver.js" {
  export class GameManager {
    static new(): GameManager;
  }

  const init: () => Promise<void>;
  export default init;
}

declare module "../pkg/solver-mt/solver.js" {
  export class GameManager {
    static new(): GameManager;
  }

  export const initThreadPool: (numThreads: number) => Promise<void>;
  export const exitThreadPool: () => Promise<void>;
  const init: () => Promise<void>;
  export default init;
}