import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { sql } from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/auth";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const rows = await sql`
            SELECT id, name, email FROM owners WHERE email = ${user.email!.toLowerCase()}
          `;
          if (rows.length === 0) {
            return "/login?error=not_registered";
          }
          const owner = rows[0];
          const token = signToken({ ownerId: owner.id, email: owner.email, name: owner.name });
          await setAuthCookie(token);
          return true;
        } catch (error) {
          console.error("Google signIn error:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session }) {
      return session;
    },
  },
});

export { handler as GET, handler as POST };
