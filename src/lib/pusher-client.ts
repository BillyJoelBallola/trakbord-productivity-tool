"use client";

let Pusher: any;

if (typeof window !== "undefined") {
  Pusher = require("pusher-js");
}

export const pusherClient = Pusher
  ? new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })
  : null;
