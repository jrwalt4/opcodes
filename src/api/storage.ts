import {
  defineDriver,
  setDriver,
  setItem,
  getItem,
  LOCALSTORAGE
} from "localforage";
import memoryStorageDriver from "localforage-memoryStorageDriver";
import { Observer, BehaviorSubject, Subscription } from "rxjs";
import { filter, distinct, map } from "rxjs/operators";
import {
  defaultRegistry,
  ID,
  OperationDefinition,
  OperationRegistry
} from "./operation";

enum RegistryKeys {
  OP_DEFS = "OP_DEF_LIST"
}

const _registry = new BehaviorSubject<OperationRegistry>([]);
const _registryDistinct = _registry.pipe(distinct());

(async function _setupRegistry(_init_registry: OperationRegistry) {
  if (process.env.NODE_ENV === "test") {
    await defineDriver(memoryStorageDriver);
    await setDriver(memoryStorageDriver._driver);
  } else {
    await setDriver(LOCALSTORAGE);
  }

  let ops = await getItem<OperationRegistry>(RegistryKeys.OP_DEFS);
  if (ops == null) {
    // initialize registry
    ops = await setItem<OperationRegistry>(
      RegistryKeys.OP_DEFS,
      _init_registry
    );
  }
  _registry.next(ops);
})(defaultRegistry);

export function watchRegistry(
  observer: Observer<OperationRegistry>
): Subscription {
  return _registryDistinct.subscribe(observer);
}

export function watchOperation(
  opId: ID,
  observer: Observer<OperationDefinition | undefined>
): Subscription {
  return _registryDistinct
    .pipe(
      map((reg) => reg.find((def) => def.id === opId)),
      filter((def) => def != null)
    )
    .subscribe(observer);
}

async function _getOperations(): Promise<OperationRegistry> {
  let ops = await getItem<OperationRegistry>(RegistryKeys.OP_DEFS);
  if (ops == null) {
    throw new Error("No registry");
  }
  return ops;
}

async function _setOperations(
  ops: OperationRegistry
): Promise<OperationRegistry> {
  return await setItem<OperationRegistry>(RegistryKeys.OP_DEFS, ops);
}

export async function addOperation(def: OperationDefinition): Promise<void> {
  let ops = await _getOperations();
  let newOps = await _setOperations(ops.concat(def));
  _registry.next(newOps);
}

export async function deleteOperation(opId: ID): Promise<void> {
  let ops = await _getOperations();
  let newOps = await _setOperations(ops.filter((def) => def.id !== opId));
  _registry.next(newOps);
}

export async function hasOperation(opId: ID): Promise<boolean> {
  let ops = await _getOperations();
  return ops.some((def) => def.id === opId);
}
