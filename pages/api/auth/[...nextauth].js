import { getUserId, insertNewUser } from "@/db/dbOperations";
import NextAuth from "next-auth"
// import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
    // GithubProvider({
    //   clientId: process.env.GITHUB_ID,
    //   clientSecret: process.env.GITHUB_SECRET,
    // }),
    // ...add more providers here
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.account = account
        token.profile = profile
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client, like a user id from the db.
      session.token = token
      let dbUserId = await getUserId(session.user.email)
      if (!dbUserId) {
        // New user: Create a new user entry in the db 
        try {
          const newUser = insertNewUser(session.user)
          dbUserId = newUser._id
        } catch (error) {
          console.error("Failed to create new user entry in db", error)
          dbUserId = ""
        }
      }
      session.user.id = dbUserId

      return session
    }
  }
}

export default NextAuth(authOptions)