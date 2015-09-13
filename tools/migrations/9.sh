#!/bin/bash

if [[ $# -lt 1 ]]; then
cat <<- EOT
	Usage: $0 <db>

EOT
exit
fi

DB=$1

read -r -d '' COMMAND <<- EOC

db.people.find().forEach(function(person){
	var migrate = false;
	
	if(person.medic && person.medic.dateOfApplicationForId){
		migrate = true;
		print('Migrating dateOfApplicationForId to dateOfRegistration', person._id);
		
		person.medic.dateOfRegistration = person.medic.dateOfApplicationForId;
		
		delete person.medic.dateOfApplicationForId;
	}

	if(person.statistic && person.statistic.dateOfExpiration){
		migrate = true;
		print('Migrating dateOfExpiration to dateOfRegistration', person._id);
		
		person.statistic.dateOfRegistration = person.statistic.dateOfExpiration;
		
		delete person.statistic.dateOfExpiration;
	}

	if(person.statistic && person.statistic.dateOfApplicationForId){
		migrate = true;
		print('Migrating dateOfApplicationForId to dateOfRegistration', person._id);
		
		person.statistic.dateOfRegistration = person.statistic.dateOfApplicationForId;
		
		delete person.statistic.dateOfApplicationForId;
	}

	if(migrate){
		db.people.update({_id : person._id}, person);
	}
});

EOC

mongo $DB --quiet --eval "$COMMAND"
