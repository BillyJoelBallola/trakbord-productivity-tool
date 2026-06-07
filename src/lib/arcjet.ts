import arcjet, { shield, slidingWindow } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // protect against common attacks
    shield({ mode: "LIVE" }),
  ],
});

// auth rate limiter — 5 requests per 10 seconds
export const authAj = aj.withRule(
  slidingWindow({
    mode: "LIVE",
    interval: "10s",
    max: 5,
  }),
);

// api rate limiter — 30 requests per minute
export const apiAj = aj.withRule(
  slidingWindow({
    mode: "LIVE",
    interval: "1m",
    max: 30,
  }),
);
