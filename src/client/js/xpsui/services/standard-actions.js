(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	/**
	 * Every function call requires context. Context should contain all necessary data
	 * for action
	 *
	 * Mandatory fields are:
	 * scope - angular scope
	 * model - shortcut to model
	 * args - function arguments defined in schema
	 * local - local scope for eval
	 * All functions can return promise. Safest way how to call function is thrue
	 * invoke method.
	 */
	.factory('xpsui:StandardActions', [
		'$q', 'xpsui:Errors', '$location', 'xpsui:SchemaTools', '$interpolate', '$http', 'xpsui:NotificationFactory',
		function(q, errors, $location, schemaTools, $interpolate, $http, notifications) {
			var StandardActions = function() {
			};

			StandardActions.prototype.invoke = function(funcName, ctx) {
				var p = q.defer();

				if (this[funcName]) {
					var self = this;
					q.when(self[funcName].call(self, (ctx)),
						function(r) {
							p.resolve(r);
						}, function(r) {
							p.reject(errors.unhandled(r));
						});

					return p.promise;
				}

				return q.reject();
			};

			StandardActions.prototype.multiSerial = function(ctx) {
				var p = q.defer();

				var actionsLeft = ctx.args.actions.slice();

				var self = this;
				function runOne(action, local) {
					if (action.func) {
						var localCtx = {
							scope: ctx.scope,
							args: action.args,
							local: local
						};

						self.invoke(action.func, localCtx).then(function(r) {
							if (actionsLeft.length > 0) {
								runOne(actionsLeft.shift(), r);
							} else {
								// nothing left we are done
								p.resolve(r);
							}
						}, function(r) {
							// failure
							p.reject(errors.unhandled(r));
						});
					}
				}

				runOne(actionsLeft.shift(), {});

				return p.promise;
			};

			/**
			 * Navigates to provided path. Path is interpolated by shole context so
			 * it can work with all required fields of scope, model, args and local (return value of previous function);
			 */
			StandardActions.prototype.navigate = function(ctx) {
				var urlDef = ctx.args.url;

				var url = $interpolate(urlDef)(ctx);

				$location.path(url);

				return q.reject();
			};

			/**
			 * Executes particular function defined in scope.
			 *
			 * ctx.args
			 * - func: name of function
			 */
			StandardActions.prototype.execScopeFunc = function(ctx) {
				if (!(ctx.args && ctx.args.func)) {
					return q.reject(errors.byCode(errors.INTERNAL_ERROR, {mgs: 'Function name not defined'}));
				}

				var funcName = ctx.args.func;

				if (ctx.scope && typeof ctx.scope[funcName] === 'function') {
					var p = q.defer();

					// TODO allow to pass parameters, use apply or call to invoke function #103744560
					q.when(ctx.scope[funcName]()).then(
						function(r) {
							p.resolve(r);
						},
						function(r) {
							p.reject(r);
						});
					return p.promise;
				} else {
					return q.reject(errors.byCode(errors.INTERNAL_ERROR, {mgs: 'Function does not exist'}));
				}
			};

			/**
			 * THIS IS NASTY QUICK HACK
			 */
			StandardActions.prototype.svfHack = function(ctx) {
				var p = q.defer();

				function get(obj, path, def) {
					var p = (path || '').split('.');

					var objFragment, pathFragment;

					objFragment = obj;

					while (p.length > 0) {
						pathFragment = p.shift();

						if (angular.isObject(objFragment)) {
							objFragment = objFragment[pathFragment];
						} else {
							return def;
						}
					}

					//TODO in case objFragment is false it returns default which is wrong
					return objFragment || def;
				}

				function set(obj, path, value) {
					if (!value) {
						return;
					}

					var p = (path || '').split('.');

					var objFragment, pathFragment;

					objFragment = obj;

					while (p.length > 0) {
						pathFragment = p.shift();

						if (!angular.isObject(objFragment[pathFragment])) {
							objFragment[pathFragment] = {};
						}

						if (p.length === 0) {
							objFragment[pathFragment] = value;
							return;
						} else {
							objFragment = objFragment[pathFragment];
						}
					}
				}

				var o = {};
				var lp;

				lp = 'baseData.id'; set(o, lp, get(ctx.model, lp, null));
				lp = 'baseData.name'; set(o, lp, get(ctx.model, lp, null));
				lp = 'baseData.surName'; set(o, lp, get(ctx.model, lp, null));
				lp = 'baseData.titleAfter'; set(o, lp, get(ctx.model, lp, null));
				lp = 'baseData.birthDate'; set(o, lp, get(ctx.model, lp, null));
				lp = 'baseData.birthDate'; set(o, lp, get(ctx.model, lp, null));
				lp = 'baseData.gender'; set(o, lp, get(ctx.model, lp, null));
				lp = 'baseData.nationality'; set(o, lp, get(ctx.model, lp, null));
				lp = 'player.isPlayer'; set(o, lp, get(ctx.model, lp, null));
				lp = 'player.stateOfPlayer'; set(o, lp, get(ctx.model, lp, null));
				lp = 'player.registrationCanceled'; set(o, lp, get(ctx.model, lp, null));
				lp = 'player.validFrom'; set(o, lp, get(ctx.model, lp, null));
				lp = 'player.validTo'; set(o, lp, get(ctx.model, lp, null));
				lp = 'officer.isOfficer'; set(o, lp, get(ctx.model, lp, null));
				lp = 'officer.stateOfOfficer'; set(o, lp, get(ctx.model, lp, null));
				lp = 'officer.association'; set(o, lp, get(ctx.model, lp, null));
				lp = 'officer.club'; set(o, lp, get(ctx.model, lp, null));
				lp = 'officer.note'; set(o, lp, get(ctx.model, lp, null));
				lp = 'officer.dateOfRegistration'; set(o, lp, get(ctx.model, lp, null));
				lp = 'officer.expiration'; set(o, lp, get(ctx.model, lp, null));
				lp = 'coach.isCoach'; set(o, lp, get(ctx.model, lp, null));
				lp = 'coach.stateOfCoach'; set(o, lp, get(ctx.model, lp, null));
				lp = 'coach.proffesionalCompetence'; set(o, lp, get(ctx.model, lp, null));
				lp = 'coach.dateOfRegistration'; set(o, lp, get(ctx.model, lp, null));
				lp = 'coach.coachLicense'; set(o, lp, get(ctx.model, lp, null));
				lp = 'coach.coachLicenseLevel'; set(o, lp, get(ctx.model, lp, null));
				lp = 'coach.coachLicenseType'; set(o, lp, get(ctx.model, lp, null));
				lp = 'coach.licenseSeminar'; set(o, lp, get(ctx.model, lp, null));
				lp = 'medic.isMedic'; set(o, lp, get(ctx.model, lp, null));
				lp = 'medic.medicLicense'; set(o, lp, get(ctx.model, lp, null));
				lp = 'medic.stateOfMedic'; set(o, lp, get(ctx.model, lp, null));
				lp = 'medic.dateOfRegistration'; set(o, lp, get(ctx.model, lp, null));
				lp = 'medic.validFrom'; set(o, lp, get(ctx.model, lp, null));
				lp = 'medic.validTo'; set(o, lp, get(ctx.model, lp, null));
				lp = 'statistic.isStatistic'; set(o, lp, get(ctx.model, lp, null));
				lp = 'statistic.statisticLicense'; set(o, lp, get(ctx.model, lp, null));
				lp = 'statistic.stateOfStatistic'; set(o, lp, get(ctx.model, lp, null));
				lp = 'statistic.dateOfRegistration'; set(o, lp, get(ctx.model, lp, null));
				lp = 'statistic.validFrom'; set(o, lp, get(ctx.model, lp, null));
				lp = 'statistic.validTo'; set(o, lp, get(ctx.model, lp, null));
				lp = 'scorer.isScorer'; set(o, lp, get(ctx.model, lp, null));
				lp = 'scorer.scorerLicense'; set(o, lp, get(ctx.model, lp, null));
				lp = 'scorer.stateOfScorer'; set(o, lp, get(ctx.model, lp, null));
				lp = 'scorer.club'; set(o, lp, get(ctx.model, lp, null));
				lp = 'scorer.dateOfRegistration'; set(o, lp, get(ctx.model, lp, null));
				lp = 'scorer.validFrom'; set(o, lp, get(ctx.model, lp, null));
				lp = 'photoInfo.photo'; set(o, lp, get(ctx.model, lp, null));
				set(o, 'id', get(ctx.model, 'peopleObjLink.people.oid', null));

				if (!o.id) {
					notifications.warn({text: 'Nepodarilo sa upraviť záznam, nie je nastavená osoba', timeout: 3000});
					return q.reject();
				}
				$http({url: '/udao/saveBySchema/uri~3A~2F~2Fregistries~2Fpeople~23views~2Ffullperson~2Fview', method: 'PUT', data: o}).then(
					function(data) {
						notifications.info({text: 'Záznam osoby upravený', timeout: 3000});
						return p.resolve(data);
					},
					function(err) {
						notifications.warn({text: 'Nepodarilo sa upraviť záznam, vykonajte manuálnu úpravu', timeout: 3000});
						return p.reject(err);
					}
				);

				return p.promise;
			};

			return new StandardActions();
		}]);
}(window.angular));
