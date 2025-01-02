// app/api/auth/[...nextauth]/route.ts
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // console.log("Authorize called with email:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        try {
          // First, let's verify our database connection
          // console.log("Attempting to connect to database...");

          // Try to find the user
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
            select: {
              id: true,
              email: true,
              password: true,
              name: true,
            },
          });

          // console.log("Database query completed. User found:", !!user);

          if (!user) {
            throw new Error("User not found");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          // console.log("Password validation result:", isPasswordValid);

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          // Return only the data we need
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          // console.error("Detailed auth error:", error);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  debug: false, // Changed this to false since we don't need debug logs anymore
});

export { handler as GET, handler as POST };
