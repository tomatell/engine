#!/bin/bash

if [[ $# -lt 1 ]]; then
cat <<- EOT
	Usage: $0 <db>

EOT
exit
fi

DB=$1
competitionID=$2

read -r -d '' COMMAND <<- EOC

db.refereeReports.find().forEach(function(report){
	var migrate = false;
	var count = 0;
	
	if(report.baseData && report.baseData.competition.oid == '$competitionID'){
		migrate = true;
		print('Deleting refereeReport:', report._id);
		
		db.refereeReports.remove({_id : report._id});
	}
});

EOC

mongo $DB --quiet --eval "$COMMAND"
