import { XYCoord } from "react-dnd";
//import { nanoid } from "@reduxjs/toolkit";

export type OperationRegistry = OperationDefinition[];

export type ID = string;
export type OperationInput = {
  [ioId: string]: boolean | number;
};
export type OperationOutput = OperationInput;
export type OperationSignature = (inputs: OperationInput) => Promise<OperationOutput>;

export interface OperationDefinition {
  id: ID;
  name: string;
  description?: string;
  inputIDs: ID[];
  outputIDs: ID[];
  definition: CodeDefinition | null;
  execute?: OperationSignature;
}

interface UserOperationDefinition extends OperationDefinition {
  definition: CodeDefinition;
}

export interface CodeDefinition {
  operations: {
    [id: string]: {
      opId: ID;
      location?: XYCoord;
      name?: string;
      description?: string;
    };
  };
  connections: OperationConnection[];
}

export interface OperationConnection {
  fromId: ID;
  toId: ID;
  path?: XYCoord[];
}

function hashId(id: string, ioId: string): string {
  return `${id}:${ioId}`;
}

function dehashId(hash: string): string {
  return hash.split(":")[1];
}

async function compileOperation(
  registry: OperationRegistry,
  op: UserOperationDefinition
): Promise<OperationSignature> {
  let opConnections = op.definition.connections;
  let opOutputIDs = op.outputIDs;
  let opOperations = Object.entries(op.definition.operations).map(
    ([id, { opId }]) => {
      let op = getOperation(registry, opId);
      return {
        id,
        opCode: opId,
        inputIDs: op.inputIDs.map((inputId) => hashId(id, inputId)),
        outputIDs: op.outputIDs.map((outputId) => hashId(id, outputId))
      };
    }
  );

  return async (inputs: OperationInput): Promise<OperationOutput> => {
    let opInputs = new Map<ID, number | boolean>();
    let opOutputs = new Map<ID, number | boolean>();
    for (let [id, val] of Object.entries(inputs)) {
      // initially set `inputs` as `outputs`, so
      // other operations will pick them up
      opOutputs.set(id, val);
    }
    let counter = 10;
    while (--counter > 0 && !opOutputIDs.every((id) => opInputs.has(id))) {
      opConnections.forEach(({ fromId, toId }) => {
        if (opOutputs.has(fromId)) {
          opInputs.set(toId, opOutputs.get(fromId)!);
        }
      });
      for (let { id, opCode, inputIDs, outputIDs } of opOperations) {
        if (outputIDs.every((outputHash) => opOutputs.has(outputHash))) {
          continue;
        }
        if (inputIDs.every((inputHash) => opInputs.has(inputHash))) {
          let inputValues = {} as OperationInput;
          inputIDs.forEach((inpID) => {
            inputValues[dehashId(inpID)] = opInputs.get(inpID)!;
          });
          let outputValues = await executeOperation(registry, opCode, inputValues);
          for (let [outId, outVal] of Object.entries(outputValues)) {
            let hash = hashId(id, outId);
            opOutputs.set(hash, outVal);
          }
        }
      }
    }
    let outputValues = {} as OperationOutput;
    if (counter === 0) {
      for (let [id, val] of opOutputs) {
        outputValues[id] = val;
      }
    } else {
      opOutputIDs.forEach((id) => {
        outputValues[id] = opInputs.get(id)!;
      });
    }
    return outputValues;
  };
}

const NotOperation: OperationSignature = ({ A }) => Promise.resolve({ Q1: !Boolean(A) });
const AndOperation: OperationSignature = ({ A, B }) => Promise.resolve({
  Q1: Boolean(A) && Boolean(B)
});

export const defaultRegistry: OperationRegistry = [
  {
    id: "AND",
    name: "AND",
    inputIDs: ["A", "B"],
    outputIDs: ["Q1"],
    definition: null,
    execute: AndOperation
  },
  {
    id: "NOT",
    name: "NOT",
    inputIDs: ["A"],
    outputIDs: ["Q1"],
    definition: null,
    execute: NotOperation
  }
];

export function getOperation(
  registry: OperationRegistry,
  opId: ID
): OperationDefinition {
  const def = registry.find((op) => op.id === opId);
  if (def == null) {
    throw new Error(`Unknwon OpCode: '${opId}'`);
  }
  return def;
}

export async function executeOperation(
  registry: OperationRegistry,
  opId: ID,
  input: OperationInput
): Promise<OperationOutput> {
  let opDef = getOperation(registry, opId);
  if (opDef == null) {
    throw new Error(`No operation "${opId}"`);
  }
  if (!opDef.inputIDs.map((id) => id in input).every((b) => b)) {
    throw new Error(
      `invalid input: (${Object.keys(input).join(",")}) (${opDef.inputIDs.join(
        ","
      )})`
    );
  }
  if (opDef.execute == null) {
    opDef.execute = await compileOperation(
      registry,
      opDef as UserOperationDefinition
    );
    //throw new Error(`Operation "${opId}" not compiled`);
  }
  return opDef.execute(input);
}
