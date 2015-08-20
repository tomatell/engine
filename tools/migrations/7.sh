#!/bin/bash

if [[ $# -lt 1 ]]; then
cat <<- EOT
	Usage: $0 <db>

EOT
exit
fi

DB=$1

read -r -d '' COMMAND <<- EOC

db.rosters.find().forEach(function(roster){
	var migrate = false;
	
	if(roster.baseData && roster.baseData.gender == 'Z'){
		migrate = true;
		print('Migrating in rosters scheme gender value Z to gender value F', roster._id);

		delete roster.baseData.gender;
		roster.baseData.gender = 'F';
	}

	if(migrate){
		db.rosters.update({_id : roster._id}, roster);
	}
});

db.people.find().forEach(function(person){
	var migrate = false;
	
	if(person.baseData && person.baseData.gender == 'Z'){
		migrate = true;
		print('Migrating in people scheme gender value Z to gender value F', person._id);

		delete person.baseData.gender;
		person.baseData.gender = 'F';
	}

	if(migrate){
		db.people.update({_id : person._id}, person);
	}
});

EOC

mongo $DB --quiet --eval "$COMMAND"
