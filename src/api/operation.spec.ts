import {
  defaultRegistry,
  executeOperation as exec,
  OperationDefinition
} from "./operation";

describe("Operation", () => {
  it("Should operate a default gate", () => {
    return Promise.all([
      expect(exec(defaultRegistry, "NOT", { A: true })).resolves.toEqual({
        Q1: false
      }),
      expect(exec(defaultRegistry, "NOT", { A: 1 })).resolves.toEqual({
        Q1: false
      })]);
  });

  it("Should compile an operation", () => {
    let registry = defaultRegistry.concat([
      {
        name: "NOT2",
        id: "NOT2",
        inputIDs: ["A"],
        outputIDs: ["Q1"],
        definition: {
          operations: {
            n1: { opId: "NOT" }
          },
          connections: [
            { fromId: "A", toId: "n1:A" },
            { fromId: "n1:Q1", toId: "Q1" }
          ]
        }
      },
      {
        name: "AND2",
        id: "AND2",
        inputIDs: ["A", "B"],
        outputIDs: ["Q1"],
        definition: {
          operations: {
            n1: { opId: "AND" }
          },
          connections: [
            { fromId: "A", toId: "n1:A" },
            { fromId: "B", toId: "n1:B" },
            { fromId: "n1:Q1", toId: "Q1" }
          ]
        }
      }
    ] as OperationDefinition[]);
    return Promise.all([
      expect(exec(registry, "NOT2", { A: true })).resolves.toEqual({ Q1: false }),
      expect(exec(registry, "NOT2", { A: false })).resolves.toEqual({ Q1: true }),
      expect(exec(registry, "AND2", { A: true, B: true })).resolves.toEqual({ Q1: true }),
      expect(exec(registry, "AND2", { A: true, B: false })).resolves.toEqual({
        Q1: false
      }),
      expect(() => exec(registry, "AND2", { A: true })).rejects
    ]);
  });
});
