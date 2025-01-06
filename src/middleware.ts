import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
})

export const config = {
  matcher: [
    "/forms/:path*",
    "/workflows/:path*",
    "/projects/:path*",
    "/settings/:path*",
  ],
} 