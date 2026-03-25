import Dexie, { Table } from "dexie";
import { ConfigValue1, migrateConfig1to2 } from "./db-migration";

export type DbItem = {
  id?: number;
  name0: string;
  name1: string;
  name2: string;
  name3: string;
  isGroup: 0;
  value: unknown;
};

export type DbGroup = {
  id?: number;
  name0: string;
  name1: string;
  name2: string;
  name3: string;
  isGroup: 1;
};

export type ResearchRunRecord = {
  id?: number;
  situationKey: string;
  treeKey: string;
  flopKey: string;
  presetId: string;
  presetLabel: string;
  boardText: string;
  updatedAt: number;
  value: unknown;
};

type ResearchRunValue = {
  serializedGame?: ArrayBuffer | Uint8Array;
};

class WASMPostflopDB extends Dexie {
  public ranges!: Table<DbItem | DbGroup, number>;
  public configurations!: Table<DbItem | DbGroup, number>;
  public researchRuns!: Table<ResearchRunRecord, number>;

  public constructor() {
    super("WASMPostflopDB");

    this.version(1).stores({
      ranges: "++id, [name0+name1+name2+name3+isGroup]",
      configurations: "++id, [name0+name1+name2+name3+isGroup]",
    });

    this.version(2)
      .stores({
        ranges: "++id, [name0+name1+name2+name3+isGroup]",
        configurations: "++id, [name0+name1+name2+name3+isGroup]",
      })
      .upgrade((tx) => {
        return tx
          .table("configurations")
          .toCollection()
          .modify((item: DbItem | DbGroup) => {
            if (!item.isGroup) {
              item.value = migrateConfig1to2(item.value as ConfigValue1);
            }
          });
      });

    this.version(3).stores({
      ranges: "++id, [name0+name1+name2+name3+isGroup]",
      configurations: "++id, [name0+name1+name2+name3+isGroup]",
      researchRuns:
        "++id, [situationKey+flopKey], situationKey, presetId, updatedAt",
    });

    this.version(4).stores({
      ranges: "++id, [name0+name1+name2+name3+isGroup]",
      configurations: "++id, [name0+name1+name2+name3+isGroup]",
      researchRuns:
        "++id, [situationKey+flopKey], situationKey, treeKey, presetId, updatedAt",
    });
  }
}

const db = new WASMPostflopDB();

const hasSerializedGame = (value: unknown) => {
  const serializedGame = (value as ResearchRunValue | undefined)
    ?.serializedGame;
  if (!serializedGame) {
    return false;
  }

  return serializedGame.byteLength > 0;
};

export const selectPreferredResearchRun = (records: ResearchRunRecord[]) => {
  if (records.length === 0) {
    return undefined;
  }

  return [...records].sort((left, right) => {
    const nativeDelta =
      Number(hasSerializedGame(right.value)) -
      Number(hasSerializedGame(left.value));
    if (nativeDelta !== 0) {
      return nativeDelta;
    }

    return right.updatedAt - left.updatedAt;
  })[0];
};

const makeParent = (item: DbItem | DbGroup) => {
  if (item.name3 !== "") {
    return { ...item, name3: "", isGroup: 1 };
  } else if (item.name2 !== "") {
    return { ...item, name2: "", isGroup: 1 };
  } else if (item.name1 !== "") {
    return { ...item, name1: "", isGroup: 1 };
  } else {
    throw new Error("Cannot make parent of top-level item");
  }
};

const makeRenamed = (item: DbItem | DbGroup, newName: string) => {
  if (item.name3 !== "") {
    return { ...item, name3: newName };
  } else if (item.name2 !== "") {
    return { ...item, name2: newName };
  } else if (item.name1 !== "") {
    return { ...item, name1: newName };
  } else {
    return { ...item, name0: newName };
  }
};

export const getArray = async (store: string) => {
  return (await db.table(store).toArray()) as (DbItem | DbGroup)[];
};

export const addItem = async (store: string, item: DbItem) => {
  try {
    const table = db.table(store);

    return await db.transaction("rw", table, async () => {
      // duplicate check
      const count = await table
        .where("[name0+name1+name2+name3]")
        .equals([item.name0, item.name1, item.name2, item.name3])
        .count();
      if (count > 0) {
        return false;
      }

      // parent check
      if (item.name1 !== "") {
        const parent = makeParent(item);
        const count = await table
          .where("[name0+name1+name2+name3+isGroup]")
          .equals([parent.name0, parent.name1, parent.name2, parent.name3, 1])
          .count();
        if (count !== 1) {
          return false;
        }
      }

      // insert
      await table.add(item);

      return true;
    });
  } catch {
    return false;
  }
};

export const overwriteItem = async (store: string, item: DbItem) => {
  try {
    const table = db.table(store);

    return await db.transaction("rw", table, async () => {
      // get collection
      const collection = table
        .where("[name0+name1+name2+name3+isGroup]")
        .equals([item.name0, item.name1, item.name2, item.name3, 0]);

      // check if exists
      if ((await collection.count()) !== 1) {
        return false;
      }

      // update
      return (await collection.modify({ value: item.value })) === 1;
    });
  } catch {
    return false;
  }
};

export const renameItem = async (
  store: string,
  item: DbItem | DbGroup,
  newName: string
) => {
  try {
    const table = db.table(store);

    return await db.transaction("rw", table, async () => {
      const renamed = makeRenamed(item, newName);

      // duplicate check
      const count = await table
        .where("[name0+name1+name2+name3]")
        .equals([renamed.name0, renamed.name1, renamed.name2, renamed.name3])
        .count();
      if (count > 0) {
        return false;
      }

      const [index, key, modifier] =
        item.name3 !== ""
          ? [
              "[name0+name1+name2+name3]",
              [item.name0, item.name1, item.name2, item.name3],
              { name3: newName },
            ]
          : item.name2 !== ""
          ? [
              "[name0+name1+name2]",
              [item.name0, item.name1, item.name2],
              { name2: newName },
            ]
          : item.name1 !== ""
          ? ["[name0+name1]", [item.name0, item.name1], { name1: newName }]
          : ["name0", item.name0, { name0: newName }];

      // update
      return (await table.where(index).equals(key).modify(modifier)) > 0;
    });
  } catch {
    return false;
  }
};

export const addGroup = async (store: string, group: DbGroup) => {
  if (group.name3 !== "") {
    return false;
  }

  try {
    const table = db.table(store);

    return await db.transaction("rw", table, async () => {
      // duplicate check
      const count = await table
        .where("[name0+name1+name2+name3]")
        .equals([group.name0, group.name1, group.name2, group.name3])
        .count();
      if (count > 0) {
        return false;
      }

      // parent check
      if (group.name1 !== "") {
        const parent = makeParent(group);
        const count = await table
          .where("[name0+name1+name2+name3+isGroup]")
          .equals([parent.name0, parent.name1, parent.name2, parent.name3, 1])
          .count();
        if (count !== 1) {
          return false;
        }
      }

      // insert
      await table.add(group);

      return true;
    });
  } catch {
    return false;
  }
};

export const deleteItem = async (store: string, item: DbItem | DbGroup) => {
  try {
    const table = db.table(store);

    return await db.transaction("rw", table, async () => {
      if (item.isGroup) {
        // check if exists
        const count = await table
          .where("[name0+name1+name2+name3+isGroup]")
          .equals([item.name0, item.name1, item.name2, item.name3, 1])
          .count();
        if (count !== 1) {
          return false;
        }

        const [index, key] =
          item.name2 !== ""
            ? ["[name0+name1+name2]", [item.name0, item.name1, item.name2]]
            : item.name1 !== ""
            ? ["[name0+name1]", [item.name0, item.name1]]
            : ["name0", item.name0];

        // delete
        return (await table.where(index).equals(key).delete()) > 0;
      } else {
        // get collection
        const collection = table
          .where("[name0+name1+name2+name3+isGroup]")
          .equals([item.name0, item.name1, item.name2, item.name3, 0]);

        // check if exists
        if ((await collection.count()) !== 1) {
          return false;
        }

        // delete
        return (await collection.delete()) === 1;
      }
    });
  } catch {
    return false;
  }
};

export const bulkAdd = async (store: string, items: (DbItem | DbGroup)[]) => {
  try {
    const table = db.table(store);

    return await db.transaction("rw", table, async () => {
      // insert
      await table.bulkAdd(items);

      return true;
    });
  } catch {
    return false;
  }
};

export const getResearchRuns = async (situationKey: string) => {
  const records = (await db.researchRuns
    .where("situationKey")
    .equals(situationKey)
    .sortBy("updatedAt")) as ResearchRunRecord[];

  const deduped = new Map<string, ResearchRunRecord>();
  for (const record of records) {
    const existing = deduped.get(record.flopKey);
    deduped.set(
      record.flopKey,
      selectPreferredResearchRun(
        existing ? [existing, record] : [record]
      ) as ResearchRunRecord
    );
  }

  return Array.from(deduped.values()).sort(
    (left, right) => left.updatedAt - right.updatedAt
  );
};

export const getResearchRun = async (situationKey: string, flopKey: string) => {
  const records = (await db.researchRuns
    .where("[situationKey+flopKey]")
    .equals([situationKey, flopKey])
    .toArray()) as ResearchRunRecord[];

  return selectPreferredResearchRun(records);
};

export const getResearchRunsByTree = async (treeKey: string) => {
  const records = (await db.researchRuns
    .where("treeKey")
    .equals(treeKey)
    .sortBy("updatedAt")) as ResearchRunRecord[];

  const deduped = new Map<string, ResearchRunRecord>();
  for (const record of records) {
    const existing = deduped.get(record.flopKey);
    deduped.set(
      record.flopKey,
      selectPreferredResearchRun(
        existing ? [existing, record] : [record]
      ) as ResearchRunRecord
    );
  }

  return Array.from(deduped.values()).sort(
    (left, right) => left.updatedAt - right.updatedAt
  );
};

export const getResearchRunByTree = async (
  treeKey: string,
  flopKey: string
) => {
  const records = (await db.researchRuns
    .where("treeKey")
    .equals(treeKey)
    .and((r) => r.flopKey === flopKey)
    .toArray()) as ResearchRunRecord[];

  return selectPreferredResearchRun(records);
};

export const getResearchRunMatches = async (
  situationKey: string,
  flopKey: string
) => {
  return (await db.researchRuns
    .where("[situationKey+flopKey]")
    .equals([situationKey, flopKey])
    .sortBy("updatedAt")) as ResearchRunRecord[];
};

export const deleteResearchRun = async (
  situationKey: string,
  flopKey: string,
  treeKey?: string
) => {
  try {
    if (treeKey) {
      return (
        (await db.researchRuns
          .where("treeKey")
          .equals(treeKey)
          .and((r) => r.flopKey === flopKey)
          .delete()) >= 0
      );
    }

    return (
      (await db.researchRuns
        .where("[situationKey+flopKey]")
        .equals([situationKey, flopKey])
        .delete()) >= 0
    );
  } catch {
    return false;
  }
};

export const putResearchRun = async (record: ResearchRunRecord) => {
  try {
    return await db.transaction("rw", db.researchRuns, async () => {
      const existingInSituation = (await db.researchRuns
        .where("[situationKey+flopKey]")
        .equals([record.situationKey, record.flopKey])
        .toArray()) as ResearchRunRecord[];

      const existingInTree = (await db.researchRuns
        .where("treeKey")
        .equals(record.treeKey)
        .and((r) => r.flopKey === record.flopKey)
        .toArray()) as ResearchRunRecord[];

      const preferredExistingSituation =
        selectPreferredResearchRun(existingInSituation);
      const preferredExistingTree = selectPreferredResearchRun(existingInTree);

      const preservedSerializedGame = hasSerializedGame(
        record.value as ResearchRunValue | undefined
      )
        ? undefined
        : (preferredExistingTree?.value as ResearchRunValue | undefined)
            ?.serializedGame;

      const nextRecord = preservedSerializedGame
        ? {
            ...record,
            value: {
              ...(record.value as Record<string, unknown>),
              serializedGame: preservedSerializedGame,
            },
          }
        : record;

      if (preferredExistingSituation?.id != null) {
        await db.researchRuns.update(preferredExistingSituation.id, nextRecord);
      } else {
        await db.researchRuns.add(nextRecord);
      }

      const duplicateIds = existingInSituation
        .map((existing) => existing.id)
        .filter(
          (id): id is number =>
            id != null && id !== preferredExistingSituation?.id
        );

      if (duplicateIds.length > 0) {
        await db.researchRuns.bulkDelete(duplicateIds);
      }

      return true;
    });
  } catch {
    return false;
  }
};

export const deleteResearchRuns = async (
  situationKey: string,
  treeKey?: string
) => {
  try {
    if (treeKey) {
      return (
        (await db.researchRuns.where("treeKey").equals(treeKey).delete()) >= 0
      );
    }

    return (
      (await db.researchRuns
        .where("situationKey")
        .equals(situationKey)
        .delete()) >= 0
    );
  } catch {
    return false;
  }
};
