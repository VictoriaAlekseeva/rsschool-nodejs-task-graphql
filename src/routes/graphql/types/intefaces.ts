import { PrismaClient, Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library.js";

export type prismaContexType = PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>