import crypto from "crypto"
const { ROOT_DOMAIN, JWT_SIGNATURE } = process.env

export async function createVerifyEmailToken(email) {
  try {
    // Auth String, JWT Signature, email
    const authString = `${JWT_SIGNATURE}:${email}`
    return crypto.createHash("sha256").update(authString).digest("hex")
  } catch (e) {
    console.log("e", e)
  }
}

export async function createVerifyEmailLink(email) {
  try {
    // Create token
    const emailToken = await createVerifyEmailToken(email)
    // Encode url string
    const URIencodedEmail = encodeURIComponent(email)
    // Return link for verification
    return `https://${ROOT_DOMAIN}:8443/verify/${URIencodedEmail}/${emailToken}`
  } catch (e) {
    console.log("e", e)
  }
}

export async function verifyEmailToken(email, token) {
  try {
    //create a token from the email that you have received from the token link and the
    //jwt signature
    const emailToken = await createVerifyEmailToken(email)

    //compare the token from the email with the token from the link
    const isValid = emailToken === token
    // If successful, update user, to make it verified
    if (isValid) {
      //update user to make it verified
      const {user}= await import("../user/user.js")
        await user.updateOne(
        { 
          "email.address": email 
        }, 
        { 
          $set: { "email.verified": true } 
        })
      return true
    }
    return false

  } catch (e) {
    console.log("e", e)
    return false
  }
}