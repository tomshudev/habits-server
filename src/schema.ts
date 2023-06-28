import { Kind } from "graphql";
import { makeSchema, scalarType } from "nexus";
import { join } from "path";
import * as types from "../graphql/types";

// export const DateScalar = scalarType({
//     name: 'Date',
//     asNexusMethod: 'date',
//     description: 'Date custom scalar type',
//     parseValue(value: any) {
//         return new Date(value)
//     },
//     serialize(value) {
//         return (value as Date).getTime()
//     },
//     parseLiteral(ast) {
//         if (ast.kind === Kind.INT) {
//             return new Date(ast.value)
//         }
//         return null
//     }
// })

export const schema = makeSchema({
  // @ts-ignore
  types: [types],
  outputs: {
    typegen: join(
      process.cwd(),
      "node_modules",
      "@types",
      "nexus-typegen",
      "index.d.ts"
    ),
    schema: join(process.cwd(), "graphql", "schema.graphql"),
  },
  contextType: {
    export: "Context",
    module: join(process.cwd(), "graphql", "context.ts"),
  },
});
