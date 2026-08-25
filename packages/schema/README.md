# Agent Interface Schema

This package defines and validates the static `agent-interface/ir/v0` document.

It is intentionally a static layer. It can express declared source facts and
deterministic inferences from those facts. It cannot assert that an Agent read a
file, called a tool, changed a product state, or recovered from an error.

## Validation layers

1. `staticIrSchema` is JSON Schema draft 2020-12 and validates document shape.
2. `validateStaticIR` adds fail-closed cross-element invariants that JSON Schema
   cannot express cleanly: source existence, global element identity, declared
   inference premises, edge endpoints, workflow sequencing, repository-relative
   source paths, and credential-free HTTPS source URLs.

The package exports structured validation issues. Callers must not turn an
invalid input into a partial successful IR.
