const axios = require("axios");
const API_KEY = process.env.API_FOOTBALL_KEY; // Store in .env
const BASE_URL = "https://v3.football.api-sports.io/";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "x-rapidapi-key": API_KEY, Accept: "application/json" },
});

//profile
const fetchTeamsInLeague = async (leagueId, seasonId) => {
  const { data } = await api.get(
    `/teams?league=${leagueId}&season=${seasonId}`
  );
  return data.response; // Adapt to your interface
};
const fetchLeagueById = async (leagueId) => {
  const { data } = await api.get(`/leagues?id=${leagueId}`);
  return data.response[0]; // Adapt to your interface
};

const fetchTeamInfo = async (teamId) => {
  const { data } = await api.get(`/teams?id=${teamId}`);
  const flag = await fetchCountryFlag(data.response[0].team.country);
  return {
    ...data.response[0],
    flag,
  }; // Adapt to your interface
};

const fetchCountryFlag = async (country) => {
  const { data } = await api.get(
    `/countries?name=${
      country.toLowerCase() === "türkiye" ? "turkey" : country.toLowerCase()
    }`
  );
  return data.response[0].flag;
};

const fetchSquad = async (teamId) => {
  const { data } = await api.get(`/players/squads?team=${teamId}`);
  return data.response[0];
};

const fetchPlayerProfile = async (playerId) => {
  const { data } = await api.get(`/players/profiles?player=${playerId}`);
  return data.response[0].player; // Adapt
};

const fetchCoachProfile = async (teamId) => {
  const { data } = await api.get(`/coachs?team=${teamId}`);
  return data.response[data.response.length - 1];
};

const fetchVenueById = async (id) => {
  const { data } = await api.get(`/venues?id=${id}`);
  return data.response[0];
};

//Matches

const fetchNextMatch = async (teamId) => {
  const { data } = await api.get(`/fixtures?team=${teamId}&next=1`);
  return data.response[0];
};

const fetchNextMatches = async (teamId) => {
  const { data } = await api.get(`/fixtures?team=${teamId}&next=5`);
  return data.response;
};

const fetchLastMatches = async (teamId) => {
  const { data } = await api.get(`/fixtures?team=${teamId}&last=5`);
  return data.response;
};

// For live: Call this in a cron job or interval on server
const fetchLiveMatch = async (teamId) => {
  const { data } = await api.get(`/fixtures?live=all&team=${teamId}`);
  return data.response[0];
};

module.exports = {
  fetchTeamsInLeague,
  fetchLeagueById,
  fetchTeamInfo,
  fetchSquad,
  fetchPlayerProfile,
  fetchCoachProfile,
  fetchCountryFlag,
  fetchVenueById,
  fetchNextMatch,
  fetchNextMatches,
  fetchLastMatches,
  fetchLiveMatch,
};
