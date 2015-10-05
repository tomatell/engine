/*globals describe,it,expect,fail,beforeEach,angular,inject */
describe('xpsui:Calculator2', function() {
	'use strict';

	var $rootScope;
	var calculator;

	// Initialize module xpsui:directives
	beforeEach(angular.mock.module('x-registries'));

	beforeEach(inject(['xpsui:calculator2', '$rootScope', function(iCalculator, iRootScope) {
		calculator = iCalculator;
		$rootScope = iRootScope;
	}]));

	it('Should has properties', function() {
		expect(calculator).to.respondTo('createCalculator');
		expect(calculator).to.respondTo('createCtx');
	});

	it('Should work as promise', function(done) {
		var recipe = {
			func: 'get',
			args: {
				modelPath: 'data.name'
			}
		};

		var scope = $rootScope.$new();
		var model = {
			data: {
				name: 'fero'
			}
		};

		var calc = calculator.createCalculator(recipe);
		calc.execute(calculator.createCtx(scope, model)).then(function(result) {
			expect(result).to.be.eql('fero');
			done();
		}, function(err) {
			fail(err);
		});
		scope.$apply();
	});

	it('Should construct forcedCriteria', function(done) {
		var recipe = {
			func: 'criteriaList',
			args: [{
				func: 'criterion',
				args: {
					f: 'baseData.club',
					op: 'eq',
					v: {
						func: 'get',
						args: {
							modelPath: 'baseData.club.oid',
							default: null
						}
					},
					nullIfEmpty: true
				}
			}, {
				func: 'criterion',
				args: {
					f: 'baseData.union',
					op: 'eq',
					v: {
						func: 'get',
						args: {
							modelPath: 'baseData.union.oid',
							default: null
						}
					},
					nullIfEmpty: true
				}
			}, {
				func: 'criterion',
				args: {
					f: 'baseData.nonExisting',
					op: 'eq',
					v: {
						func: 'get',
						args: {
							modelPath: 'baseData.nonExisting.oid',
							default: null
						}
					},
					nullIfEmpty: true
				}
			}]
		};

		var scope = $rootScope.$new();
		var model = {
			baseData: {
				club: {
					oid: 123
				},
				union: {
					oid: 567
				}
			}
		};

		var expected = [
			{f: 'baseData.club', op: 'eq', v: 123},
			{f: 'baseData.union', op: 'eq', v: 567}
		];

		var calc = calculator.createCalculator(recipe);
		calc.execute(calculator.createCtx(scope, model)).then(function(result) {
			expect(result).to.be.eql(expected);
			done();
		}, function(err) {
			fail(err);
		});
		scope.$apply();
	});
});
