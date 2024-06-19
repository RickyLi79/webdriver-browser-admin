import loki, { Collection } from 'lokijs';
import LokiIndexedAdapter from 'lokijs/src/loki-indexed-adapter';
import { setupProjectApi } from './ProjectApi';
import { TABLE_NAME, tables } from './entity/tables';
// import type { DomDriverModel } from './model/domDriverModel';
import { setupResourceApi } from './ResourceApi';

const databaseID = 'wdb';

let _db: Loki;
let collections: Recordable<Collection>;
let _dbInitedResolve: (flag: boolean) => void;
const dbInited = new Promise<boolean>((resolve) => {
  _dbInitedResolve = resolve;
});

function dbInit() {
  Object.entries(tables).forEach(([key, iTable]) => {
    const collection = _db.getCollection(key);
    if (collection === null) {
      collections![key] = _db.addCollection(key, iTable);
    } else {
      collections[key] = collection;
    }
  });
  _dbInitedResolve(true);
}
function getDb() {
  if (!_db) {
    collections = {};
    _db = new loki(databaseID, {
      env: 'BROWSER',
      adapter: new LokiIndexedAdapter(databaseID),
      autoload: true,
      autosave: true,
      autosaveInterval: 3000,
      autoloadCallback: dbInit,
    });
  }
  return _db;
}
async function getCollection<T extends object>(key: string): Promise<Collection<T>> {
  await dbInited;
  return collections[key];
}

async function dropIndexedDB() {
  if (!import.meta.env.DEV) return;
  const infos = await indexedDB.databases();
  infos.forEach((i) => indexedDB.deleteDatabase(i.name!));
}

async function resetDevRecords() {
  if (!import.meta.env.DEV) return;
  await Promise.all(
    Object.entries(TABLE_NAME).map(([_key, iTableName]) => {
      return getCollection<{ isDev?: boolean }>(iTableName).then((col) => {
        col.chain().find({ isDev: true }).remove();
      });
    }),
  );
  _db.saveDatabase(function (err) {
    if (err) {
      console.log('error : ' + err);
    } else {
      console.log('database saved.');
    }
  });
}

// async function domDriversList() {
//   const col = await getCollection<DomDriverModel>(TABLE_NAME.DOM_DRIVERS);
//   const records = col.find();
//   return lokiDocToRawArr(records);
// }

type ILokiDocToRaw = {
  <E extends (object & LokiObj) | undefined | null>(
    doc: E,
  ): E extends undefined | null ? undefined : E extends LokiObj & infer T ? T : never;
};
type ILokiDocToRawArr = {
  <E extends object & LokiObj>(doc: E[]): Array<E extends LokiObj & infer T ? T : never>;
};

const lokiDocToRaw: ILokiDocToRaw = function (doc: any) {
  if (doc === undefined || doc === null) return undefined;
  const doc2 = {
    ...doc,
  };
  delete doc2['$loki'];
  return doc2;
};
const lokiDocToRawArr: ILokiDocToRawArr = function (doc: any[]) {
  const re: any[] = doc.map((iDoc) => {
    const doc2 = {
      ...iDoc,
    };
    delete doc2['$loki'];
    return doc2;
  });
  return re;
};

const lokiApi = {
  db: undefined as any as Loki,
  getCollection,
  dropIndexedDB,
  resetDevRecords,
  lokiDocToRaw,
  lokiDocToRawArr,
};

export type ILokiApi = typeof lokiApi;

let inited = false;
export function setupWdbApi() {
  if (inited) return;
  inited = true;
  const db = getDb();
  lokiApi.db = db;

  setupProjectApi(lokiApi);
  setupResourceApi(lokiApi);

  return db;
}
// setupWdbApi();

export const wdbLocalApi = {
  dropIndexedDB,

  resetDevRecords,
  // domDriversList,
};
