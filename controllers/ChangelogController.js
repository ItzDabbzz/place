exports.getMissedChangelogs = (req, res, next) => {
    if(req.user.changelogOptedOut) return res.json({success: true, changelogs: []});
    var changelogs;
    if(req.user.latestChangelogFetch) changelogs = req.place.changelogManager.getChangelogsSince(req.user.latestChangelogFetch);
    else changelogs = req.place.changelogManager.getChangelogs();
    changelogs = changelogs.slice(0, 2);
    if(changelogs[0]) {
        req.user.latestChangelogFetch = changelogs[0].version;
        req.user.save();
    }
    res.json({success: true, changelogs: changelogs, pagination: req.place.changelogManager.getPaginationInfo(changelogs[changelogs.length - 1])});
}

exports.deleteMissedChangelogs = (req, res, next) => {
    req.user.changelogOptedOut = true;
    req.user.save().then(() => res.json({success: true})).catch((err) => {
        req.place.logger.error("Changelogs", "Couldn't opt user out of changelogs: " + err);
        res.status(500).json({success: false, error: {message: "An unknown error occurred while trying to opt you out of missed changelogs.", code: "server_error"}});
    });
}

exports.getLatestChangelog = (req, res, next) => {
    var changelog = req.place.changelogManager.getLatestChangelog();
    res.json({success: true, changelog: changelog, pagination: changelog ? req.place.changelogManager.getPaginationInfo(changelog.version) : null});
}

exports.getChangelog = (req, res, next) => {
    if(!req.params.version) return res.status(400).json({success: false, error: {message: "You must specify the changelog version to get.", code: "bad_request"}});
    var changelog = req.place.changelogManager.getChangelog(req.params.version);
    if(!changelog) res.status(404);
    res.json({success: true, changelog: changelog, pagination: req.place.changelogManager.getPaginationInfo(req.params.version)});
}