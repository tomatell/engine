#!/bin/bash

if [[ $# -lt 1 ]]; then
cat <<- EOT
	Usage: $0 <db>

EOT
exit
fi

DB=$1

read -r -d '' COMMAND <<- EOC

db.refereeReports.find().forEach(function(report){
	var migrate = false;
	var count = 0;
	
	if(report.baseData && report.baseData.homeClub && report.baseData.awayClub){
		migrate = true;
		print('Sets clubs by clubs of roster', report._id);

		var home = db.rosters.findOne({_id : ObjectId(report.baseData.homeClub.oid)});
		var away = db.rosters.findOne({_id : ObjectId(report.baseData.awayClub.oid)});

		report.baseData.homeClubSec = home.baseData.club;
		report.baseData.awayClubSec = away.baseData.club;
	}

	if(migrate){
		db.refereeReports.update({_id : report._id}, report);
	}
});



EOC

mongo $DB --quiet --eval "$COMMAND"