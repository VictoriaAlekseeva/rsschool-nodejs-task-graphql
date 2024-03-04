import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLFloat, GraphQLBoolean, GraphQLInt, GraphQLList } from "graphql"
import { UUIDType } from "./uuid.js"
import { prismaContexType } from './intefaces.js'
import { resolve } from "path"


const User = new GraphQLObjectType({
  name: 'User',
  description: 'List of users',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      type: Profile,
      resolve: (parent, args, ctx: prismaContexType) => ctx.profile.findUnique({ where: { userId: parent.id } })
    }, // Profile?
    posts: {
      type: new GraphQLList(Post),
    },             // Post[]
    userSubscribedTo: {
      type: new GraphQLList(SubscribersOnAuthors),
      resolve: async (parent, args, ctx: prismaContexType) => {
        return await ctx.subscribersOnAuthors
          .findMany({ where: { subscriberId: parent.id } })
          .then(subscribers => Promise.all(subscribers.map(subscriber => ctx.user.findUnique({ where: { id: subscriber.subscriberId } }))))
      }
    }, //SubscribersOnAuthors[] @relation("subscriber")
    subscribedToUser: {
      type: new GraphQLList(SubscribersOnAuthors),
      resolve: async (parent, args, ctx: prismaContexType) => {
        return await ctx.subscribersOnAuthors
          .findMany({ where: { authorId: parent.authorId } })
          .then(subscribers => Promise.all(subscribers.map(subscriber => ctx.user.findUnique({ where: { id: subscriber.authorId } }))))
      }
    }
    // subscribedToUser: { type: new GraphQLList(SubscribersOnAuthors) }//SubscribersOnAuthors[] @relation("author")
  })
})

const Profile = new GraphQLObjectType({
  name: 'Profile',
  description: 'A type representing a user profile',
  fields: () => ({
    id: { type: GraphQLString },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    user: {
      type: User,
      resolve: async (parent, args, ctx) => {
        return await ctx.user.findUnique({
          where: { id: parent.userId }
        });
      }
    },
    memberType: {
      type: MemberType,
      resolve: async (parent, args, ctx) => {
        return await ctx.memberType.findUnique({
          where: { id: parent.memberTypeId }
        });
      }
    }
  })
});



const Post = new GraphQLObjectType({
  name: 'Post',
  description: 'Post',
  fields: () => ({
    id: { type: UUIDType },      //String @id @default(uuid())
    title: { type: GraphQLString },   //String
    content: { type: GraphQLString }, //String

    author: { type: User },   //!User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
    authorId: { type: GraphQLString } //String
  })
})
const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  description: 'MemberType',
  fields: () => ({
    id: { type: GraphQLString },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
    profiles: {
      type: new GraphQLList(Profile),
      resolve: async (parent, args, ctx) => {
        return await ctx.db.profile.findMany({
          where: {
            memberTypeId: parent.id
          }
        });
      }
    }
  })
});



const SubscribersOnAuthors = new GraphQLObjectType({
  name: 'SubscribersOnAuthors',
  description: 'SubscribersOnAuthors',
  fields: () => ({
    subscriber: {
      type: User,
      resolve: (parent, args, ctx: prismaContexType) => {
        return ctx.user.findUnique({
          where: {
            id: parent.subscriberId
          }
        });
      }
    },
    subscriberId: { type: GraphQLString },
    author: {
      type: User,
      resolve: (parent, args, ctx: prismaContexType) => {
        return ctx.user.findUnique({
          where: {
            id: parent.authorId
          }
        });
      }
    },
    authorId: { type: GraphQLString },
  })
});

// const rootMutation = new GraphQLObjectType({
//   name: 'Mutation',
//   fields: {

//   }
// })

const rootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    // getUsers: {

    // }


  }
})

export const schema = new GraphQLSchema({
  query: rootQuery,
  // mutation: rootMutation
})
