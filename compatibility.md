# Compatibility requirements

## 1
data/partials/x-help.html has to be created. It should contain help page.

## 2
Instances without the requests feature can be raised to this version without any changes.

In instances with requests, /schemas/requests.json has to be divided into generalRequests.json, registrationRequests.json, dataChangeRequests.json and transferRequests.json (except for data-sba where only general requests are currently implemented)
This also entails modifying the request-modified handler, x-main-menu and others.
All of this should already be on the respective repos, so only a fetch is needed.

The requests collection in the database also needs to be divided. There are scripts for this in tools/mongo/:

	- splitMigrationCheck.sh - doesn't actually modify the database, it only reports where it would move each request
	- splitMigration.sh - performs the division, drops the 'requests' collection if it ends up being empty

## 3 - Structure of bank records import changed

It is necesary to migrate structure of bank imports. Run `tools/migrations/3.sh`

## 4 - Array component changed

1. Update the schemas in each dataset to use the new array structure
2. Migrate existing db's by running `tools/migrations/4.sh`

## No version change
config.js needs to contain these e-mail addresses
- eventProcessingErrorSender
- eventProcessingError
- massmailSenderAddress
- requestNotifSender
- requestSolverAddress

## 5 - RefereeReport schema changes

1. webNumber field changed and relocated in schema
2. RefereeReports are used just in SZH instance, so migration is necessary only there
2. Migrate existing db's by running`tools/migrations/5.sh`

## 6 - RefereeReport schema changes data upgrade script
- assigns home and away clubs acording setup in rosters

## 7 - Gender shortcut fix in rosters and people
- unifies gented to F for females

