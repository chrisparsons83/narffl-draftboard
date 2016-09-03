var express = require('express');
var router = express.Router();
var flea = require('flea-killer');
var urlapi = require('url');

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { title: 'Fleaflicker Draft Board' });
});
router.post('/', function (req, res) {
  var url = urlapi.parse(req.body.fleaflickerUrl);
  var pathArray = url.path.split('/');
  if (pathArray[3].match(/^[0-9]+$/) == null) {
    res.status(500).send('Please use a URL in the format http://www.fleaflicker.com/nfl/leagues/xxxxxx/drafts where xxxxxx is your league number');
  }

  res.redirect(303, '/nfl/leagues/' + pathArray[3] + '/drafts');
});
router.get('/nfl/leagues/:leagueid/drafts', function (req, res) {
    var leagueId = req.params.leagueid;
    flea.draft.get('nfl', leagueId, 2016, function (err, draft) {
        if (err) { return console.log('Handle Errors', err); }
        
      // Group picks into rounds
        var picks = [];
        var roundPicks = [];
        for (var i = 0, tot = draft.picks.length; i < tot; i += draft.teams.length) {
          roundPicks = [];
          for (var j = i, subTot = i + draft.teams.length; j < subTot; j++) {
            roundPicks.push(draft.picks[j]);
          }
          // If round is even, reverse them, due to it being a snake draft
          if (draft.picks[i].round % 2 == 0) {
            roundPicks.reverse();
          }
          picks.push(roundPicks);
        }
        // Reverse even rounds because snake

        res.render('draftboard', {
            title: draft.league.name,
            teams: draft.teams,
            picks: picks
        });
    });
});

module.exports = router;