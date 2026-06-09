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
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const rows = await sql`
            SELECT id, name, email FROM owners WHERE email = ${user.email!.toLowerCase()}
          `;
          let owner;
          if (rows.length === 0) {
            const newOwner = await sql`
              INSERT INTO owners (name, email, password_hash)
              VALUES (${user.name || "Owner"}, ${user.email!.toLowerCase()}, 'google-oauth')
              RETURNING id, name, email
            `;
            owner = newOwner[0];
          } else {
            owner = rows[0];
          }
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
