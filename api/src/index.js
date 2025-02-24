import "./env.js"
import { fastify } from "fastify"
import fastifyStatic from "fastify-static"
import fastifyCookie from "@fastify/cookie"
import fastifyCors from "fastify-cors"
import path from "path"
import { fileURLToPath } from "url"
import { connectDb } from "./db.js"
import { registerUser } from "./accounts/register.js"
import { authorizeUser } from "./accounts/authorize.js"
import { logUserIn } from "./accounts/logUserIn.js"
import { logUserOut } from "./accounts/logUserOut.js"
import { getUserFromCookies } from "./accounts/user.js"
import { sendEmail, mailInit } from "./mail/index.js"
import { createVerifyEmailLink } from "./accounts/verify.js"

// ESM specific features
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = fastify()

async function startApp() {
  try {
    await mailInit()

    app.register(fastifyCors, { 
      origin: ["https://nodeauth.dev:8443", /.nodeauth.dev/], 
      credentials: true, })

    app.register(fastifyCookie, {
      secret: process.env.COOKIE_SIGNATURE,
    })

    app.register(fastifyStatic, {
      root: path.join(__dirname, "public"),
    })

    app.post("/api/register", {}, async (request, reply) => {
      try {
        const userId = await registerUser(
          request.body.email,
          request.body.password
        )
        // If account creations was successful
        if (userId) {
          const emailLink = await createVerifyEmailLink(request.body.email)
          await sendEmail({
            to: request.body.email,
            subject: "Verify your email",
            html: `<a href="${emailLink}">verify</a>`,
          })

          await logUserIn(userId, request, reply)
          reply.send({
            data: {
              status: "SUCCESS",
              userId,
            },
          })
        }
      } catch (e) {
        console.error(e)
        reply.send({
          data: {
            status: "FAILED",
            userId,
          },
        })
      }
    })

    app.post("/api/authorize", {}, async (request, reply) => {
      try {
        const { isAuthorized, userId } = await authorizeUser(
          request.body.email,
          request.body.password
        )
        if (isAuthorized) {
          await logUserIn(userId, request, reply)
          reply.send({
            data: {
              status: "SUCCESS",
              userId,
            },
          })
        }
      } catch (e) {
        console.error(e)
        reply.send({
          data: {
            status: "FAILED",
            userId,
          },
        })
      }
    })

    app.post("/api/logout", {}, async (request, reply) => {
      try {
        await logUserOut(request, reply)
        reply.send({
          data: {
            status: "SUCCESS",
          },
        })
      } catch (e) {
        console.error(e)
        reply.send({
          data: {
            status: "FAILED",
            userId,
          },
        })
      }
    })

    app.get("/test", {}, async (request, reply) => {
      try {
        // Verify user login
        const user = await getUserFromCookies(request, reply)
        // Return user email, if it exists, otherwise return unauthorized
        if (user?._id) {
          reply.send({
            data: user,
          })
        } else {
          reply.send({
            data: "User Lookup Failed",
          })
        }
      } catch (e) {
        throw new Error(e)
      }
    })

    await app.listen(5000)
    console.log("🚀 Server Listening at port: 5000")
  } catch (e) {
    console.error(e)
  }
}

connectDb().then(() => {
  startApp()
})
