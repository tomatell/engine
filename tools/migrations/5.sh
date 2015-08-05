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
	
	if(report.delegatedPerson && report.delegatedPerson.webNumber){
		migrate = true;
		print('Migrating webNumber to matchNumber', report._id);
		
		report.baseData.matchNumber = report.delegatedPerson.webNumber;
		
		delete report.delegatedPerson.webNumber;
	}

	if(migrate){
		db.refereeReports.update({_id : report._id}, report);
	}
});



EOC

mongo $DB --quiet --eval "$COMMAND"
