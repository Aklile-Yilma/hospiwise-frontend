import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
// import { twoFactor } from 'better-auth/plugins';
import { getDatabase } from './mongodb';
import { nextCookies } from 'better-auth/next-js';
// import { sendOTPEmail } from './sendEmail';

export const auth = betterAuth({
  appName: 'Hospiwise',
  // baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  baseURL: 'http://localhost:3000',
  database: mongodbAdapter(getDatabase()),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false
    // requireEmailVerification: false,
  },  
  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID!,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  //     redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
  //   },
  // },
  plugins: [
    nextCookies()
  ]
  
  // plugins: [
  //   twoFactor({
  //     issuer: 'Hospiwise',
  //     otpOptions: {
  //       async sendOTP({ user, otp }) {
  //         // Send OTP via email
  //         await sendOTPEmail(user.email, otp);
  //       },
  //     },
  //   }),
  // ],
  
  // user: {
  //   additionalFields: {
  //     role: {
  //       type: 'string',
  //       required: false,
  //       defaultValue: 'user',
  //     },
  //     department: {
  //       type: 'string',
  //       required: false,
  //     },
  //     phone: {
  //       type: 'string',
  //       required: false,
  //     },
  //   },
  // },
  
  // session: {
  //   expiresIn: 60 * 60 * 24 * 7, // 7 days
  //   updateAge: 60 * 60 * 24, // 1 day
  // },
}

);