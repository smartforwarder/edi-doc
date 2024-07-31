#!/usr/bin/env node
const dotenv = require("dotenv");
const axios = require("axios");
const data = require("./data.json");
const fs = require("fs");
const { faker } = require("@faker-js/faker");
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
  const fakeData = await getFakeData();
  const { data: resp } = await axios.post(`${API}/v1/shipments`, fakeData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  // write the fake data to a file
  fs.writeFileSync("data.json", JSON.stringify(fakeData, null, 2));
  if (resp.success) {
    console.log("EDI document created successfully");
  } else {
    console.error("Failed to create EDI document");
  }
}

async function getFakeData() {
  data.mbl_no =
    faker.string.alpha({ length: 4, casing: "upper" }) +
    faker.string.numeric(6);
  data.hbls = data.hbls.map((hbl) => {
    hbl.hbl_no =
      faker.string.alpha({ length: 4, casing: "upper" }) +
      faker.string.numeric(6);
    return hbl;
  });
  return data;
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
