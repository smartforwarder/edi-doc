#!/usr/bin/env node
const dotenv = require("dotenv");
const axios = require("axios");
dotenv.config();

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  "x-smartforwarder-appid": "123",
};

main();
async function main() {
  const token = await getToken("http://localhost:1337");
  console.log(token);
}

async function getToken(api) {
  const { data } = await axios.post(
    `${api}/auth/local`,
    {
      identifier: process.env.APPID,
      password: process.env.SECRET,
      //shop: host === "localhost" ? host : `${host}.smartforwarder.co`,
      shop: "localhost",
    },
    { headers: DEFAULT_HEADERS }
  );
  return data.jwt;
}
