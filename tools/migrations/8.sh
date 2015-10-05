#!/bin/bash

if [[ $# -lt 1 ]]; then
cat <<- EOT
	Usage: $0 <db>

EOT
exit
fi

DB=$1

read -r -d '' COMMAND <<- EOC

var clubAdressCount = db.organizations.find({'clubAdress':{\$exists:true}}).count();

db.organizations.find().forEach(function(club){
	var migrate = false;
	
	if(club.clubAdress){
		migrate = true;
		club.contactAdress = {};
		
		print('Migrating clubAdress to contactAdress', club._id);

		club.contactAdress = club.clubAdress;

		delete club.clubAdress;
	}

	if(migrate){
		db.organizations.update({_id: club._id}, club);
	}
});

var contactAdressCount = db.organizations.find({'contactAdress':{\$exists:true}}).count();
print('Before migration count of club with clubAdress fields', clubAdressCount);
print('After migration count of club with contactAdressCount fields', contactAdressCount);

EOC

mongo $DB --quiet --eval "$COMMAND"
