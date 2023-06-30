import { enumType, extendType, nonNull, objectType, stringArg } from "nexus";
import { Habit } from "./Habit";

export const User = objectType({
  name: "User",
  definition(t) {
    t.string("id");
    t.string("name");
    t.string("email");
    t.string("image");
    t.field("role", { type: Role });
    t.list.field("habits", {
      type: Habit,
      async resolve(parent, _args, ctx) {
        return await ctx.prisma.habit.findMany({
          where: {
            userId: parent.id!,
          },
        });
      },
    });
  },
});

const Role = enumType({
  name: "Role",
  members: ["USER", "ADMIN"],
});

export const UsersQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.field("users", {
      type: "User",
      resolve(_parennt, _args, ctx) {
        return ctx.prisma.user.findMany();
      },
    });
  },
});

export const UserQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("user", {
      type: "User",
      args: { userId: nonNull(stringArg()) },
      resolve(_parennt, args, ctx) {
        return ctx.prisma.user.findUnique({
          where: {
            id: args.userId,
          },
        });
      },
    });
  },
});

export const CreateUserMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("createUser", {
      type: User,
      args: {
        email: nonNull(stringArg()),
        name: nonNull(stringArg()),
        image: stringArg(),
      },
      async resolve(_parent, args, ctx) {
        const userObj = { ...args };

        console.log("creating new user");

        let user = await ctx.prisma.user.findUnique({
          where: {
            email: userObj.email,
          },
        });

        if (!user) {
          user = await ctx.prisma.user.create({
            data: {
              email: userObj.email!,
              name: userObj.name!,
              image: userObj.image,
              role: "USER",
            },
          });
        }

        return { id: user.id };
      },
    });
  },
});
