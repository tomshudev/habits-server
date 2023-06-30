import { extendType, intArg, nonNull, objectType, stringArg, arg } from "nexus";
import webPush from "web-push";

export const Subscription = objectType({
  name: "Subscription",
  definition(t) {
    t.string("endpoint");
    t.int("expirationTime");
    t.field("keys", { type: "JSON" });
  },
});

export const SubscriptionsQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.field("subscriptions", {
      type: "Subscription",
      resolve(_parent, _args, ctx) {
        return ctx.prisma.subscription.findMany();
      },
    });
  },
});

export const CreateSubscriptionMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("createSubscription", {
      type: Subscription,
      args: {
        endpoint: nonNull(stringArg()),
        expirationTime: intArg(),
        keys: arg({
          type: "JSON",
        }),
      },
      async resolve(_parent, args, ctx) {
        const newSubscription = { ...args };

        console.log("creating new subscription", newSubscription);

        const sub = await ctx.prisma.subscription.create({
          data: newSubscription,
        });

        const options = {
          vapidDetails: {
            subject: "mailto:tomshudev@gmail.com",
            publicKey: process.env.PUBLIC_KEY!,
            privateKey: process.env.PRIVATE_KEY!,
          },
        };

        try {
          console.log("sending notification");
          const res = await webPush.sendNotification(
            {
              endpoint: newSubscription.endpoint,
              keys: {
                auth: newSubscription.keys.auth!,
                p256dh: newSubscription.keys.p256dh!,
              },
            },
            JSON.stringify({
              title: "Hello from server",
              description: "this message is coming from the server",
              image:
                "https://cdn2.vectorstock.com/i/thumb-large/94/66/emoji-smile-icon-symbol-smiley-face-vector-26119466.jpg",
            }),
            options
          );
        } catch (e) {
          console.error("failed to send", e);
        }

        console.log("was able to send notification");

        return sub;
      },
    });
  },
});
