(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:GeneratorsGenerator', [ '$http', 'xpsui:safeUrlEncoder',
		'xpsui:SchemaUtil','$q','xpsui:ObjectTools', 
		function($http, urlEncoder,schemaUtilFactory,$q,objectTools) {
		var service = {};

		/** Counts porter(-berger) table
		 * @teams - array of objects that will be used to define match
		 * @terms - array of object that will be used to define round, its size limits result
		 * @returns - object in form
				[{ round:<index>,term:<round_term>,matches:[{home:teams[x1],visitors:teams[y1],board:<board_index>},...] },...]
		 */
		function bergerTable(teams,terms) {

			var floatTable = [];
			var n, i, increment=1, atype=1, minmove=0, flipcolors=0;

			if (teams.length%2===1) {
				teams.push({complement:true});
			}

			n = teams.length;

			var nr = n-1; // Number of rounds

			var n2 = n / 2;
			var x, j, temp, colorFlag, incr;

			var max_round = terms.length;

			var test_r = 0;
			var outRounds=[];

			var textPrefix = 'A-';
			var match_id = 0;

			for (var r=1; r<= max_round; r++) {	// r is the round number.
			
				var outRound={round:r,term:terms[r-1],matches:[]};
				outRounds.push(outRound);

				if(r == nr+1) {
					match_id=0;
					textPrefix = 'B-';
				}

				if(r == 1) {		 // Round 1 initially seat the players
					incr=n-3; j = 0;

					for (i = 1; i < n; i++) {
						floatTable[j]=i;
						j += incr;
						j = j % (n-1);
					}
					floatTable[nr]=n;	// Identifies the "ghost" player, will not move
				}else {			// Other rounds, rotate the players "clockwise"
					temp = floatTable[n-2];
					for (i=n-2;	i > 0 ; i--) {
						floatTable[i] = floatTable[i-1];
					}
					floatTable[0] = temp;
				}
				if (r == n) {
					flipcolors ^= 1; // Swap colors for 2nd half
					test_r = 1; 
				}

				i=0; // i is the board number about to be displayed, changed at bottom of loop
				if (atype == '1')
					increment=2;

				while (1) {	 //Must get out of this loop with break
					
					match_id++;

					var matchPrefix=textPrefix+match_id;

					if (i === 0)	 //At ghost board, color determined by round number
						colorFlag = ((r-test_r)%2) ? 1 : 0;
					else			//On other boards, board number determines it
						colorFlag = (i % 2) ? 0 : 1;

					colorFlag ^= flipcolors; //Will reverse color assignment if checked


					var match={home:teams[floatTable[colorFlag?nr-i:i]-1].team ,visitors:teams[floatTable[colorFlag?i:nr-i]-1].team ,boar:i ,matchNumber:matchPrefix, homeClub:teams[floatTable[colorFlag?nr-i:i]-1].club ,visitorClub:teams[floatTable[colorFlag?i:nr-i]-1].club};

					if (i===0) {
						match={home:match.visitors,visitors:match.home,board:i, matchNumber:matchPrefix, homeClub:match.visitorClub, visitorClub:match.homeClub};
					}

					if (match.home.complement) {
						outRound.notPlaying=match.visitors;
					} else if (match.visitors.complement) {
						outRound.notPlaying=match.home;
					} else {
						outRound.matches.push(match);
					}

					if (minmove && (i===0) && (r % 2)===0)
						i = 1;
					else
						i+= increment;
					if (i >= n2)
						if (increment == 1)	//Board number option
							break;
						else	{	//Come back to display the boards we missed
							increment = -2;
							i = ((i > n2) ? i - 3 : --i) ;
						}
					if ((i < 1) && (increment == -2)) //Finished with NOT board number option, exit loop
						break;
				}
			}

			// console.log(outRounds);
			// console.log(JSON.stringify(outRounds));
			return outRounds;
		}

		function saveBerger(entity,callback) {

			var saveSchema= schemaUtilFactory.encodeUri('uri://registries/refereeReports#views/refereeReports/new');
			var saved=0;
			var all=[];

			entity.saving=true;

			entity.generated.map(function(round) {
				round.matches.map(function(match) {
					var toSave={};
					toSave.baseData={};
					toSave.baseData.competition={schema:'uri://registries/competitions#views/competitions/view',oid:entity.baseData.competition.oid};
					toSave.baseData.season={schema:'uri://registries/seasons#views/seasons/view',oid:entity.competitionData.baseData.season.oid};
					toSave.baseData.competitionPart={schema:'uri://registries/competitionPart#views/competitionPart/view',oid:entity.id};
					toSave.baseData.ageCategory={schema:'uri://registries/ageCategory#views/ageCategory/view',oid:entity.competitionData.baseData.ageCategory.oid};
					toSave.baseData.homeClubSec={schema:'uri://registries/organizations#views/club/view',oid:match.homeClub.oid};
					toSave.baseData.awayClubSec={schema:'uri://registries/organizations#views/club/view',oid:match.visitorClub.oid};
					toSave.baseData.homeClub={schema:'uri://registries/rosters#views/rosters/view',oid:match.home.oid};
					toSave.baseData.awayClub={schema:'uri://registries/rosters#views/rosters/view',oid:match.visitors.oid};
					toSave.baseData.matchRound={schema:'uri://registries/schedule#views/schedule/view',oid:round.term.id};
					toSave.baseData.matchDate=round.term.baseData.date;
					toSave.baseData.state='Otvorený';

					if (entity.baseData.prefix) {
						toSave.baseData.matchNumber=entity.baseData.prefix+match.matchNumber;
					};
												
					all.push( $http({url: '/udao/saveBySchema/'+saveSchema, method: 'PUT',data: toSave}));
				});
			});
			$q.all(all).then(function() {
				callback(null);
			});
		}

		function generateBerger(entity,callback) {
			var searchSchema='uri://registries/schedule#views/schedule/search';
			$http({
				method : 'POST',
				url : '/search/' + schemaUtilFactory.encodeUri(searchSchema),
				data : {
					crits :[{
						f : 'baseData.competitionPart.oid',
						v : entity.id,
						op : 'eq'
					}],
					sorts: [ { f:'baseData.date', o: 'asc'}]
				}
			}).success(function(terms) {
				var teams=entity.listOfTeam.team;

				var n = teams.length;
				
				//get competition object
				var getSchemaCompetition = 'uri://registries/competitions#views/competitions/';
				$http({ 
					method : 'GET',
					url: '/udao/getBySchema/'+schemaUtilFactory.encodeUri(schemaUtilFactory.concatUri(getSchemaCompetition, 'view'))+'/'+ entity.baseData.competition.oid
				})
				.success(function(dataCom) {
					console.log(JSON.stringify(dataCom, null, 4));
					entity.competitionData = dataCom;

					//get roster object
					var getSchemaRoster = 'uri://registries/rosters#views/rosters/';
					var httpArray = [];

					for (var i = 0; i < n; i++) {
						httpArray.push(
							$http({ 
								method : 'GET',
								url: '/udao/getBySchema/'+schemaUtilFactory.encodeUri(schemaUtilFactory.concatUri(getSchemaRoster, 'view'))+'/'+ entity.listOfTeam.team[i].team.oid
							})
						);
					};

					$q.all(httpArray).then(function(listOfRoster) {
						if(!entity.rosters) {
							entity.rosters = {};
						}
						entity.rosters = listOfRoster;
						var rosters = entity.rosters;

						for (var i = 0; i < n; i++) {
							teams[i].club = rosters[i].data.baseData.club;
						}

						entity.generated=bergerTable(teams,terms);

						callback();
					});

				}).error(function(err) {
					callback(err);
				});

			}).error(function(err) {
				callback(err);
			});
		}

		function generateUserAccounting(entity,callback) {

			$http({
				method : 'GET',
				url : '/info/accounting/user/' + entity.id,

			}).success(function(info) {
				entity.accounting=info;
				callback();
			}).error(function(err) {
				callback(err);
			});
		}

		function generateClubAccounting(entity,callback) {

			$http({
				method : 'get',
				url : '/info/accounting/club/' + entity.id,

			}).success(function(info) {
				entity.accounting=info;
				callback();
			}).error(function(err) {
				callback(err);
			});
		}


		service.exportCsv = function() {
			var c = convertCriteria($scope.searchCrit);
			// add forced criteria
			for (var idx = 0; idx < $scope.forcedCriterias.length; idx++) {
				c.push($scope.forcedCriterias[idx]);
			}
			genericSearchFactory.getSearch($scope.entityUri, $scope.lastCriteria,convertSortBy( $scope.sortBy),0,1000).success(function(data) {

				data=toHtml($scope.schema,data);

				var blob = new Blob([data], {type: 'application/vnd.ms-excel;charset=utf-8'});
				var url  =  window.webkitURL||window.URL;
				var link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
				link.href = url.createObjectURL(blob);
				link.download = 'search-export.xls'; // whatever file name you want :)

				var event = document.createEvent('MouseEvents');
				event.initEvent('click', true, false);
				link.dispatchEvent(event);

			}).error(function(err) {
				notificationFactory.error(err);
			});
		};

		service.generate=function(entity,type,callback) {
			switch (type) {
				case 'BERGER':
					generateBerger(entity,callback);
					break;
				case 'USER-ACCOUNTING':
					generateUserAccounting(entity,callback);
					break;
				case 'CLUB-ACCOUNTING':
					generateClubAccounting(entity,callback);
					break;
			}
		};
		service.save=function(entity,type,callback) {
			switch (type) {
				case 'BERGER':
					saveBerger(entity,callback);
					break;
			}
		};

		return service;
	}]);

}(window.angular));
