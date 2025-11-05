const {
  fetchTeamInfo,
  fetchCoachProfile,
  fetchSquad,
  fetchPlayerProfile,
  fetchLeagueById,
  fetchCountryFlag,
  fetchTeamsInLeague,
  fetchVenueById,
} = require("../services/apiFootballService");
const { getCachedData } = require("../utils/cache");
const Bluebird = require("bluebird");
const getProfile = async (req, res) => {
  const teamId = parseInt(req.params.teamId);
  try {
    const teamInfo = await getCachedData(`team_${teamId}`, () =>
      fetchTeamInfo(teamId)
    );
    const coach = await getCachedData(`coach_${teamId}`, () =>
      fetchCoachProfile(teamId)
    );
    const squad = await getCachedData(`squad_${teamId}`, () =>
      fetchSquad(teamId)
    );

    const players = await Bluebird.map(
      squad.players,
      (p) =>
        getCachedData(`player_${p.id}`, () => fetchPlayerProfile(p.id), 86400), // 24h TTL
      { concurrency: 5 }
    );

    res.json({
      teamInfo,
      coach: { team: { id: teamId }, player: coach },
      players: { team: { id: teamId }, player: players },
    });
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

const getTeamsInLeague = async (req, res) => {
  const leagueId = parseInt(req.params.leagueId);
  const seasonId = parseInt(req.params.seasonId);
  try {
    const data = await getCachedData(
      `teams_${leagueId}_${seasonId}`,
      () => fetchTeamsInLeague(leagueId, seasonId),
      86400
    ); // 24h TTL
    res.json(data);
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Failed to fetch teams in league" });
  }
};
const getTeamInfo = async (req, res) => {
  const teamId = parseInt(req.params.teamId);
  try {
    const data = await getCachedData(
      `team_${teamId}`,
      () => fetchTeamInfo(teamId),
      86400
    ); // 24h TTL
    res.json(data);
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Failed to fetch team info" });
  }
};
const getCoach = async (req, res) => {
  const teamId = parseInt(req.params.teamId);
  try {
    const data = await getCachedData(
      `coach_${teamId}`,
      () => fetchCoachProfile(teamId),
      86400
    ); // 24h TTL
    res.json(data);
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Failed to fetch coach" });
  }
};
const getSquad = async (req, res) => {
  const teamId = parseInt(req.params.teamId);
  try {
    const data = await getCachedData(
      `squad_${teamId}`,
      () => fetchCoach(teamId),
      86400
    ); // 24h TTL
    res.json(data);
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Failed to fetch squad" });
  }
};
const getLeagueById = async (req, res) => {
  const leagueId = parseInt(req.params.leagueId);
  try {
    const data = await getCachedData(
      `league_${leagueId}`,
      () => fetchLeagueById(leagueId),
      86400
    ); // 24h TTL
    res.json(data);
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Failed to fetch league" });
  }
};
const getCountryFlag = async (req, res) => {
  const name = req.params.name;
  try {
    const data = await getCachedData(
      `flag_${name}`,
      () => fetchCountryFlag(name),
      86400
    ); // 24h TTL
    res.json(data);
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Failed to fetch flag" });
  }
};
const getVenueById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const data = await getCachedData(
      `venue_${id}`,
      () => fetchVenueById(id),
      86400
    ); // 24h TTL
    res.json(data);
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Failed to fetch venue" });
  }
};
module.exports = {
  getTeamInfo,
  getCoach,
  getSquad,
  getCountryFlag,
  getTeamsInLeague,
  getLeagueById,
  getVenueById,
  getProfile,
};
