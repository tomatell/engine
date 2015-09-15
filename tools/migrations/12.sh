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
	
	if(person.idInfo && person.idInfo.currnetId){
		migrate = true;
		print('Migrating currnetId to currentId', person._id);
		
		person.idInfo.currentId = person.idInfo.currnetId;
		
		delete person.idInfo.currnetId;
	}

	if(migrate){
		db.people.update({_id : person._id}, person);
	}
});



EOC

mongo $DB --quiet --eval "$COMMAND"
