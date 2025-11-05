const express = require("express");
const router = express.Router();
const {
  getTeamInfo,
  getCoach,
  getSquad,
  getCountryFlag,
  getTeamsInLeague,
  getLeagueById,
  getVenueById,
  getProfile,
} = require("../controller/profileController");

router.get("/profile/:teamId", getProfile);
router.get("/coach/:teamId", getCoach);
router.get("/squad/:teamId", getSquad);
router.get("/teams/:leagueId/:seasonId", getTeamsInLeague);
router.get("/flag/:name", getCountryFlag);
router.get("/team/:teamId", getTeamInfo);
router.get("/league/:leagueId", getLeagueById);
router.get("/venue/:id", getVenueById);

module.exports = router;
