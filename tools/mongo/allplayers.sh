#!/bin/bash

if [[ $# -lt 1 ]]; then
cat <<- EOT
	Usage: $0 <db> [limit]
	Shows list of all players into application.
EOT
exit
fi

DB=$1

read -r -d '' COMMAND <<- EOC

print(
	'meno;priezvisko;datum_narodenia;cislo_hracskej_licencie;datum_platnosti;matersky_klub;klubova_prislusnost;hostovanie_od;hostovanie_do'
);

db.people.find({'player.isPlayer':'TRUE'}).forEach(function(person){

	if(person.baseData && !person.baseData.name){
		person.baseData.name = {};
		person.baseData.name.v = '';
	}

	if(person.baseData && !person.baseData.surName){
		person.baseData.surName = {};
		person.baseData.surName.v = '';
	}

	if(person.baseData && !person.baseData.birthDate){
		person.baseData.birthDate = '';
	}
	else{
		if (person.baseData.birthDate && person.baseData.birthDate.length === 8) {
			person.baseData.birthDate = person.baseData.birthDate.substring(6, 8).concat('.', person.baseData.birthDate.substring(4, 6), '.', person.baseData.birthDate.substring(0, 4));
		}
	}

	if(person.player && !person.player.playerLicense){
		person.player.playerLicense = '';
	}

	if(person.player && !person.player.validFrom){
		person.player.validFrom = '';
	}
	else{
		if (person.player.validFrom && person.player.validFrom.length === 8) {
			person.player.validFrom = person.player.validFrom.substring(6, 8).concat('.', person.player.validFrom.substring(4, 6), '.', person.player.validFrom.substring(0, 4));
		}
	}

	if(person.player && !person.player.clubOfFirstRegistration){
		var firstClub = {};
		firstClub.club = {};
		firstClub.club.name = {};
		firstClub.club.name.v = '';
	}
	else{
		var firstClub = {};
		firstClub = db.organizations.findOne({_id : ObjectId(person.player.clubOfFirstRegistration.oid)});
	}

	if(person.player && !person.player.club){
		var club = {};
		club.club = {};
		club.club.name = {};
		club.club.name.v = '';
	}
	else{
		var club = {};
		club = db.organizations.findOne({_id : ObjectId(person.player.club.oid)});
	}

	if(person.player && !person.player.hostingStartDate){
		person.player.hostingStartDate = '';
	}
	else{
		if (person.player.hostingStartDate && person.player.hostingStartDate.length === 8) {
			person.player.hostingStartDate = person.player.hostingStartDate.substring(6, 8).concat('.', person.player.hostingStartDate.substring(4, 6), '.', person.player.hostingStartDate.substring(0, 4));
		}
	}

	if(person.player && !person.player.hostingEndDate){
		person.player.hostingEndDate = '';
	}
	else{
		if (person.player.hostingEndDate && person.player.hostingEndDate.length === 8) {
			person.player.hostingEndDate = person.player.hostingEndDate.substring(6, 8).concat('.', person.player.hostingEndDate.substring(4, 6), '.', person.player.hostingEndDate.substring(0, 4));
		}
	}
	
	print(
		person.baseData.name.v,';',person.baseData.surName.v,';',person.baseData.birthDate,';',person.player.playerLicense,';',person.player.validFrom,';',firstClub.club.name.v,';',club.club.name.v,';',person.player.hostingStartDate,';',person.player.hostingEndDate,';'
	);
});
EOC

mongo $DB --quiet --eval "$COMMAND"
