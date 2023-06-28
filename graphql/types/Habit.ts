import { Category, Habit as HabitType } from '@prisma/client'
import {
  extendType,
  floatArg,
  intArg,
  nonNull,
  objectType,
  scalarType,
  stringArg,
} from 'nexus'
// import { DateScalar } from '../schema'
import { GraphQLScalarType } from 'graphql'
import { GraphQLJSONObject } from 'graphql-type-json'
var GraphQLDate = require('graphql-date')

export const JSONScalar = scalarType({
  name: 'JSON',
  serialize: GraphQLJSONObject.serialize,
  parseValue: GraphQLJSONObject.parseValue,
  parseLiteral: GraphQLJSONObject.parseLiteral,
})

export const DateScalar = scalarType({
  name: 'Date',
  serialize: (value: unknown) => {
    return value
  },
  parseValue: (value) => {
    return new Date(value as number)
  },
})

export const Habit = objectType({
  name: 'Habit',
  definition(t) {
    t.string('id')
    t.string('userId')
    t.field('definition', { type: 'JSON' })
    t.string('category')
    // @ts-ignore
    // t.int('startDate')
    t.string('name'), t.field('startDate', { type: 'Date' })
    t.string('description')
  },
})

export const CreateExpenseMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createExpense', {
      type: Habit,
      args: {
        expense: nonNull(floatArg()),
        userId: nonNull(stringArg()),
        category: nonNull(stringArg()),
        storeName: nonNull(stringArg()),
        description: stringArg(),
        date: nonNull(intArg()),
      },
      async resolve(_parent, args, ctx) {
        const newHabit = { ...args, category: args.category as Category }

        return await ctx.prisma.habit.create({
          data: newHabit,
        })
      },
    })
  },
})

export const Edge = objectType({
  name: 'Edge',
  definition(t) {
    t.string('cursor')
    t.field('node', {
      type: Habit,
    })
  },
})

export const PageInfo = objectType({
  name: 'PageInfo',
  definition(t) {
    t.string('endCursor')
    t.boolean('hasNextPage')
  },
})

export const Response = objectType({
  name: 'Response',
  definition(t) {
    t.field('pageInfo', { type: PageInfo })
    t.list.field('edges', { type: Edge })
  },
})

export const HabitsResponse = objectType({
  name: 'HabitsResponse',
  definition(t) {
    t.list.field('habits', { type: Habit })
  },
})

export const HabitsQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('habits', {
      type: 'Response',
      args: {
        first: intArg(),
        after: stringArg(),
        userId: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        let queryResults: HabitType[] | null = null

        const baseQuery = {
          take: args.first!,
          where: {
            userId: args.userId,
          },
        }

        if (args.after) {
          queryResults = await ctx.prisma.habit.findMany({
            skip: 1,
            cursor: {
              id: args.after,
            },
            ...baseQuery,
          })
        } else {
          queryResults = await ctx.prisma.habit.findMany({
            ...baseQuery,
          })
        }

        if (queryResults && queryResults.length > 0) {
          const lastExpenseInResult = queryResults[queryResults.length - 1]
          const cursor = lastExpenseInResult.id

          const secondQueryResults = await ctx.prisma.habit.findMany({
            cursor: {
              id: cursor,
            },
            skip: 1,
            ...baseQuery,
          })

          return {
            edges: queryResults.map((expense) => ({
              cursor: expense.id,
              node: expense,
            })),
            pageInfo: {
              endCursor: cursor,
              hasNextPage: secondQueryResults.length >= args.first!,
            },
          }
        }

        return {
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
          edges: [],
        }
      },
    })
  },
})

// export const ExpensesBetweenDatesQuery = extendType({
//   type: 'Query',
//   definition(t) {
//     t.field('expensesInMonth', {
//       type: 'HabitsResponse',
//       args: {
//         userId: nonNull(stringArg()),
//         startDate: nonNull(intArg()),
//         endDate: nonNull(intArg()),
//       },
//       async resolve(_parent, args, ctx) {
//         let queryResults: HabitType[] | null = null

//         queryResults = await ctx.prisma.habit.findMany({
//           where: {
//             userId: args.userId,
//             startDate: {
//               gte: args.startDate,
//               lte: args.endDate,
//             },
//           },
//         })

//         return {
//           expenses: queryResults,
//         }
//       },
//     })
//   },
// })
