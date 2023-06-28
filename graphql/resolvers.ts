import { Context } from './context'

export const resolvers = {
  Query: {
    habits: async (_parent: any, _args: any, ctx: Context) =>
      await await ctx.prisma.habit.findMany(),
    // expensesInMonth: async (_parent, args: any, ctx: Context) =>
    //   await ctx.prisma.expense.findMany({
    //     where: {
    //       date: {
    //         gte: args.startDate,
    //         lte: args.endDate,
    //       },
    //     },
    //   }),
  },
}

// expensesInMonth(endDate: Date!, startDate: Date!, userId: String!): ExpensesResponse
// expensesInMonth(endDate: Int!, startDate: Int!, userId: String!): NEXUS__UNKNOWN__TYPE
