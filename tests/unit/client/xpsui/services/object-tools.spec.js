/*globals angular, beforeEach, describe, it, inject, expect */
/*eslint no-unused-expressions: 0*/
describe('xpsui:ObjectTools', function() {
	'use strict';

	beforeEach(angular.mock.module('x-registries'));

	it('Base functionality', function(done) {
		inject(['xpsui:ObjectTools', function(objectTools) {
			expect(objectTools).to.exist;

			var srcObj = {
				a: 'a',
				b: 'b'
			};

			var valid = {
				a: 'a',
				b: 'b',
				x: {
					y: {
						z: 'z'
					}
				}
			};

			objectTools.setObjectFragment(srcObj, 'x.y', {z: 'z'});
			expect(srcObj).to.be.eql(valid);

			objectTools.setObjectFragment(srcObj, 'x.q', null);
			expect(srcObj).to.have.deep.property('x.q', null);

			done();
		}]);
	});
});
