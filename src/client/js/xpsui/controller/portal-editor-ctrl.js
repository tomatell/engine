(function(angular) {
  'use strict';

  angular.module('xpsui:controllers')
  .controller('xpsui:PortalEditorCtrl', ['$scope', '$sce', '$http', 'xpsui:NotificationFactory',
    '$route', '$routeParams', '$location', 'xpsui:DateUtil', '$q',
    function($scope, $sce, $http, notificationFactory, $route, $routeParams, $location, dateUtils, $q) {
		$scope.model = {};
		$scope.showButtons = false;

		var templatePromise =
			$http({
				method: 'GET',
				url: '/portal/templates/getAll',
				data: {}
			});

		var blocksPromise =
			$http({
				method: 'GET',
				url: '/portal/blocks/getAll',
				data: {}
			});

		console.log($routeParams);

		$q.all([templatePromise, blocksPromise]).then(function(response) {
			$scope.templates = response[0].data;
			$scope.blocks = response[1].data;
			$scope.showButtons = true;
		}, function(error) {
			notificationFactory.error(error.data);
		});

    if ($routeParams.id) {
      $http({
        url: '/udao/get/portalArticles/' + $routeParams.id,
        method: 'GET',
      })
      .success(function(data, status, headers, config){
        $scope.model = data;
        $scope.viewTemplate = $scope.getViewTemplate();

      }).error(function(err) {
        notificationFactory.error({translationCode:'registry.unsuccesfully.saved', time:3000});
      });
    } else {
      $http({
        method : 'POST',
        url: '/portalapi/getByTags',
        data: {
          tags: ['menu:index']
        }
      })
      .success(function(data, status, headers, config) {
        if (data && data.length > 0 && data[0].id) {
          $location.path('/portal/edit/'+ data[0].id);
          //$route.updateParams({id: data[0].id});
        }
      }).error(function(err) {
        notificationFactory.error(err);
      });
    }
    function enterEditMode() {
      $scope.mode = 'edit';
      $scope.$broadcast('modechange');
    }

    $scope.edit = function addNew() {
      enterEditMode();
    };

    $scope.addNew = function addNew() {
      $scope.model = {};
      angular.copy($scope.templates.Article, $scope.model);
      if($scope.model.meta.publishFrom === null) {
      	$scope.model.meta.publishFrom = dateUtils.nowToReverse();
      }
      $scope.viewTemplate = $scope.getViewTemplate();
      enterEditMode();
    };

    $scope.findSurrogateTitle = function(pageBlocks) {
      if (pageBlocks) {
        for(var i = 0; i < pageBlocks.length; i++) {
          if (pageBlocks[i].meta.name == 'title') {
            return pageBlocks[i].data.replace('<h1>', '').replace('</h1>', '');
          }
        }
      }
      return '';
    }

    $scope.save = function() {
      if ($scope.model.meta) {
        $scope.model.meta.lastModTimestamp = (new Date()).getTime();
        if (!$scope.model.meta.title) {
          var surrogateTitle = $scope.findSurrogateTitle($scope.model.data);
          $scope.model.meta.title = surrogateTitle;
        }
      }
      $http({
        url: '/udao/save/portalArticles',
        method: 'PUT',
        data: $scope.model
      })
      .success(function(data, status, headers, config){
        notificationFactory.clear();
        if (data.id) {
          $location.path('/portal/edit/'+ data.id);
          //$route.updateParams({id: data.id});
        } else if ($scope.model.id) {
          $route.reload();
        }
      }).error(function(err) {
        notificationFactory.error({translationCode:'registry.unsuccesfully.saved', time:3000});
      });
    };

    $scope.cancel = function() {
      $route.reload();
    };

    $scope.showBlockSelector = function showBlockSelector() {
      $scope.blockSelectorShown = true;
		  document.querySelector('body').classList.add('x-dropdown-open');
    };

    $scope.hideBlockSelector = function hideBlockSelector() {
      $scope.blockSelectorShown = false;
      document.querySelector('body').classList.remove('x-dropdown-open');
    };

    $scope.selectBlock = function(block) {
      $scope.blockSelectorShown = false;
      document.querySelector('body').classList.remove('x-dropdown-open');
      $scope.model.data.push(angular.copy($scope.blocks[block]));
      $scope.$broadcast('modechange');
    };

    $scope.makeSafe = function(str) {
      return $sce.trustAsHtml(str);
    };

    $scope.getViewTemplate = function() {
      if ($scope.model && $scope.model.meta && $scope.model.meta.template) {
        return '/portal/templates/'+$scope.model.meta.template+'.html';
      } else {
        return null;
      }
    };
    // 05.28.2015 Add a hover effect to display descriptions. Added by Tom Tanaka.
    $scope.hoverShowDesc = function(desc) {
        // Shows/hides the delete div on hover
    	$scope.msg = desc;
    }
    
    $scope.hoverCloseWhite = function() {
        // Change the color of the close button to white.
    	$scope.color = "white";
    }
    
    $scope.hoverCloseBlack = function() {
        // Change the color of the close button to black.
    	$scope.color = "black";
    }

    

    
  }]);
}(angular));
