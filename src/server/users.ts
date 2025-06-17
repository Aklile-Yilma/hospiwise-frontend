"use server";

import { auth } from "@/lib/auth";



export const signIn = async () => {

    return await auth.api.signInEmail(({
        body: {
            email: "aklileyilma@gmail.com",
            password: "Test@123"
        }
    }))
}

export const signUp = async () => {

    return await auth.api.signUpEmail(({
        body: {
            email: "aklileyilma@gmail.com",
            password: "Test@123",
            name: "Aklile"
        }
    }))
}