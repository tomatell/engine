#!/bin/bash

if [[ $# -lt 1 ]]; then
cat <<- EOT
	Usage: $0 <db>

EOT
exit
fi

DB=$1

read -r -d '' COMMAND <<- EOC

db.dataChangeRequests.find().forEach(function(dataChangeRequests){
	var migrate = false;
	
	if(dataChangeRequests.requestData && dataChangeRequests.requestData.status == 'storno'){
		migrate = true;
		print('Migrating in dataChangeRequests scheme status value storno to value canceled', dataChangeRequests._id);

		delete dataChangeRequests.requestData.status;
		dataChangeRequests.requestData.status = 'canceled';
	}

	if(dataChangeRequests.requestData && dataChangeRequests.requestData.status == 'reject'){
		migrate = true;
		print('Migrating in dataChangeRequests scheme status value reject to value rejected', dataChangeRequests._id);

		delete dataChangeRequests.requestData.status;
		dataChangeRequests.requestData.status = 'rejected';
	}

	if(migrate){
		db.dataChangeRequests.update({_id : dataChangeRequests._id}, dataChangeRequests);
	}
});

db.transferRequests.find().forEach(function(transferRequests){
	var migrate = false;
	
	if(transferRequests.requestData && transferRequests.requestData.status == 'storno'){
		migrate = true;
		print('Migrating in transferRequests scheme status value storno to value canceled', transferRequests._id);

		delete transferRequests.requestData.status;
		transferRequests.requestData.status = 'canceled';
	}

	if(transferRequests.requestData && transferRequests.requestData.status == 'reject'){
		migrate = true;
		print('Migrating in transferRequests scheme status value reject to value rejected', transferRequests._id);

		delete transferRequests.requestData.status;
		transferRequests.requestData.status = 'rejected';
	}

	if(migrate){
		db.transferRequests.update({_id : transferRequests._id}, transferRequests);
	}
});

db.registrationRequests.find().forEach(function(registrationRequests){
	var migrate = false;
	
	if(registrationRequests.requestData && registrationRequests.requestData.status == 'storno'){
		migrate = true;
		print('Migrating in registrationRequests scheme status value storno to value canceled', registrationRequests._id);

		delete registrationRequests.requestData.status;
		registrationRequests.requestData.status = 'canceled';
	}

	if(registrationRequests.requestData && registrationRequests.requestData.status == 'reject'){
		migrate = true;
		print('Migrating in registrationRequests scheme status value reject to value rejected', registrationRequests._id);

		delete registrationRequests.requestData.status;
		registrationRequests.requestData.status = 'rejected';
	}

	if(migrate){
		db.registrationRequests.update({_id : registrationRequests._id}, registrationRequests);
	}
});

EOC

mongo $DB --quiet --eval "$COMMAND"
