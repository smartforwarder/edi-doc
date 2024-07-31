#!/usr/bin/env node
const dotenv = require("dotenv");
const axios = require("axios");
const data = require("./data.json");
const API = "http://localhost:1337";
dotenv.config();

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  "x-smartforwarder-appid": "123",
};

main();
async function main() {
  const token = await getToken(API);
  console.log(`Token: ${token}`);
  const { resp } = await axios.post(`${API}/v1/shipments`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  console.log(resp);
}

async function getToken() {
  const { data } = await axios.post(
    `${API}/auth/local`,
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
