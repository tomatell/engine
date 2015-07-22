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
	
	if(report.listOfPlayersGuest && report.listOfPlayersGuest.players){
		migrate = true;
		print('Migrating referee report ', report._id);
		report.listOfPlayersGuest.players.forEach(function(item){
			if(item.oid){
				item.player = {};
				item.player.oid = item.oid;
				delete item.oid;
				if(item.registry){
					item.player.registry = item.registry;
					delete item.registry;
				}
				if(item.schema){
					item.player.schema = item.schema;
					delete item.schema;
				}
			}
		});
	}

	if(report.listOfPlayersHome && report.listOfPlayersHome.players){
		migrate = true;
		report.listOfPlayersHome.players.forEach(function(item){
			if(item.oid){
				item.player = {};
				item.player.oid = item.oid;
				delete item.oid;
				if(item.registry){
					item.player.registry = item.registry;
					delete item.registry;
				}
				if(item.schema){
					item.player.schema = item.schema;
					delete item.schema;
				}
			}
		});
	}
	if(migrate){
		db.refereeReports.update({_id : report._id}, report);
	}
});

db.competitionParts.find().forEach(function(part){
	if(part.listOfTeam && part.listOfTeam.team){
		print('Migrating competition part ', part._id);
		part.listOfTeam.team.forEach(function(item){
			if(item.oid){
				item.team = {};
				item.team.oid = item.oid;
				delete item.oid;
				if(item.registry){
					item.team.registry = item.registry;
					delete item.registry;
				}
				if(item.schema){
					item.team.schema = item.schema;
					delete item.schema;
				}
			}
		});
		db.competitionParts.update({_id: part._id}, part);
	}
});

db.rosters.find().forEach(function(roster){
	if(roster.listOfPlayers && roster.listOfPlayers.players){
		print('Migrating roster ', roster._id);
		roster.listOfPlayers.players.forEach(function(item){
			if(item.oid){
				item.player = {};
				item.player.oid = item.oid;
				delete item.oid;
				if(item.registry){
					item.player.registry = item.registry;
					delete item.registry;
				}
				if(item.schema){
					item.player.schema = item.schema;
					delete item.schema;
				}
			}
		});
		db.rosters.update({_id: roster._id}, roster);
	}
});

db.nominations.find().forEach(function(nomination){
	if(nomination.listOfPlayers && nomination.listOfPlayers.players){
		print('Migrating nomination ', nomination._id);
		nomination.listOfPlayers.players.forEach(function(item){
			if(item.oid){
				item.player = {};
				item.player.oid = item.oid;
				delete item.oid;
				if(item.registry){
					item.player.registry = item.registry;
					delete item.registry;
				}
				if(item.schema){
					item.player.schema = item.schema;
					delete item.schema;
				}
			}
		});
		db.nominations.update({_id: nomination._id}, nomination);
	}
});

db.organizations.find().forEach(function(organization){
	if(organization.clubStatutory && organization.clubStatutory.person){
		print('Migrating organization ', organization._id);
		organization.clubStatutory.person.forEach(function(item){
			if(item.oid){
				item.person = {};
				item.person.oid = item.oid;
				delete item.oid;
				if(item.registry){
					item.person.registry = item.registry;
					delete item.registry;
				}
				if(item.schema){
					item.person.schema = item.schema;
					delete item.schema;
				}
			}
		});
		db.organizations.update({_id: organization._id}, organization);
	}
});

var attachMigration = function(collection){
	db.getCollection(collection).find().forEach(function(doc){
		if(doc.attachments && doc.attachments.attachments){
			print('Migrating request ', doc._id);
			doc.attachments.attachments.forEach(function(item){
				if(item && item.fileId && item.fileName){
					item.file = {};
					item.file.fileId = item.fileId;
					item.file.fileName = item.fileName;
					item.file.size = item.size;
					item.file.contentType = item.contentType;

					delete item.fileId;
					delete item.fileName;
					delete item.size;
					delete item.contentType;
				}
			});
			db.getCollection(collection).update({_id : doc._id}, doc);
		}
	});
};

attachMigration('generalRequests');
attachMigration('registrationRequests');
attachMigration('dataChangeRequests');
attachMigration('transferRequests');

EOC

mongo $DB --quiet --eval "$COMMAND"
