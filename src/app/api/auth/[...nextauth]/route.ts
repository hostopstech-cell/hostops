import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { sql } from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";

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
          const email = user.email!.toLowerCase();

          // STEP 1: Partner check PEHLE — agar partner hai toh block karo
          const partnerRows = await sql`
            SELECT id FROM referral_agents WHERE email = ${email}
          `;
          if (partnerRows.length > 0) {
            return "/login?error=partner_account";
          }

          // STEP 2: Existing owner — login karo
          const ownerRows = await sql`
            SELECT id, name, email FROM owners WHERE email = ${email}
          `;
          if (ownerRows.length > 0) {
            const owner = ownerRows[0];
            await sql`UPDATE owners SET email_verified = true WHERE id = ${owner.id}`;
            const token = signToken({ ownerId: owner.id, email: owner.email, name: owner.name });
            await setAuthCookie(token);
            return true;
          }

          // STEP 3: Naya user — owner banao
          const hash = await bcrypt.hash("google-" + email, 10);
          const newOwner = await sql`
            INSERT INTO owners (name, email, password_hash, email_verified)
            VALUES (${user.name || "Owner"}, ${email}, ${hash}, true)
            RETURNING id, name, email
          `;
          const owner = newOwner[0];
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
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/login?error=")) return baseUrl + url;
      return baseUrl + "/dashboard";
    },
  },
});

export { handler as GET, handler as POST };
