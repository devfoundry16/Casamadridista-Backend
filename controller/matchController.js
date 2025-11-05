const {
  fetchNextMatch,
  fetchNextMatches,
  fetchLastMatches,
  fetchLiveMatch,
} = require("../services/apiFootballService");
const { getCachedData } = require("../utils/cache");

const getNextMatch = async (req, res) => {
  const teamId = parseInt(req.params.teamId);
  try {
    const data = await getCachedData(
      `next_match_${teamId}`,
      () => fetchNextMatch(teamId),
      300
    ); // 5min TTL
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch next match" });
  }
};

const getNextMatches = async (req, res) => {
  const teamId = parseInt(req.params.teamId);
  try {
    const data = await getCachedData(
      `next_matches_${teamId}`,
      () => fetchNextMatches(teamId),
      3600
    ); // 1h TTL
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch next matches" });
  }
};

const getLastMatches = async (req, res) => {
  const teamId = parseInt(req.params.teamId);
  try {
    const data = await getCachedData(
      `last_matches_${teamId}`,
      () => fetchLastMatches(teamId),
      3600
    ); // 1h TTL
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch last matches" });
  }
};

const getLiveMatch = async (req, res) => {
  const teamId = parseInt(req.params.teamId);
  try {
    const data = await getCachedData(
      `live_match_${teamId}`,
      () => fetchLiveMatch(teamId),
      60
    ); // 1h TTL
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch live match" });
  }
};

// Add live endpoint similarly, with shorter TTL (e.g., 60s)

module.exports = { getLastMatches, getNextMatches, getLiveMatch, getNextMatch };
