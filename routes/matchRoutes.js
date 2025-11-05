const express = require("express");
const router = express.Router();
const {
  getNextMatch,
  getLiveMatch,
  getNextMatches,
  getLastMatches,
} = require("../controller/matchController");

router.get("/next-match/:teamId", getNextMatch);
router.get("/next-matches/:teamId", getNextMatches);
router.get("/last-matches/:teamId", getLastMatches);
router.get("/live-match/:teamId", getLiveMatch);

module.exports = router;
