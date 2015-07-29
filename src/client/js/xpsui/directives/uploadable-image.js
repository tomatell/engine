(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiUploadableImage', ['xpsui:FileUploadFactory','xpsui:NotificationFactory', '$compile', function(psFileUploadFactory,notificationFactory, $compile) {
		return {
			restrict: 'A',
			require: ['?ngModel', 'xpsuiUploadableImage'],
			scope: true,
			controller: function() {
					this.srcElm = null,
					this.imageProcessed = function(blob) {}
			},
			link: function(scope, elm, attrs, ctrls) {
				var fileButton = angular.element('<input type="file"></input>');
				var imgLink = '';
				var imgWidth = attrs.psuiWidth || 0;
				var progressIndicator = angular.element(
					'<div class="xpsui-progress-indicator">'
					+ '<div ng-style="{\'width\': progress * 100 + \'%\' }"></div>'
					+ '</div>'
					);
				var imgHeight = attrs.psuiHeight || 0;
				
				scope.progress = 0;

				$compile(progressIndicator.contents())(scope);

				if (!attrs.hasOwnProperty('style')) {
					elm.attr('style', 
							(imgHeight ? 'height:'+imgHeight+'px !important;':'')
						);
				}

				elm.addClass('xpsui-uploadable-image');
				elm.append(fileButton);
				fileButton.addClass('xpsui-uploadable-image-fbutton');

				scope.$on('psui:fileupload-progress', function(event, data){
					scope.$apply(function(){
						scope.progress = data.uploader.progress;
						if(scope.progress > 1){
							scope.progress = 1;
						}
					});
				});

				elm.on('click', function(evt) {
					fileButton[0].click();
				});

				var commit = function() {
				};

				var imgCtrl = ctrls[1];
				fileButton.on('change', function(evt) {
					var file = fileButton[0].files[0];

					if (file) {	
						if (file.type !== 'image/jpeg') {
							//TODO do something clever
							notificationFactory.error({translationCode:'psui.uploadable.image.unsupported.image.type'});
							scope.$apply(function () {});
						} else {
							if (imgCtrl && imgCtrl.srcElm) {
								var urlObject;
							   	if (typeof webkitURL !== 'undefined') {
								   urlObject = webkitURL;
								} else {
									urlObject = URL;
								};
								imgCtrl.srcElm.src = urlObject.createObjectURL(file);
								imgCtrl.imageProcessed = function(blob) {
									elm.append(progressIndicator);

									var uploader = new psFileUploadFactory.FileUploader(scope, blob, 'image/jpeg', '/photos/putgetpath/');
									uploader.upload(function(err, path) {
										if (err) {
											notificationFactory.error(err);
										}
										elm.css('background-image', 'url(/photos/get/' + path+')');
										progressIndicator.remove();
										commit('/photos/get/' + path);
									});
								}
							} else {
								var uploader = new psFileUploadFactory.FileUploader(scope, file, file.type, '/photos/putgetpath/');
								uploader.upload(function(err, path) {
									if (err) {
										notificationFactory.error(err);
									}

									elm.css('background-image', 'url(/photos/get/' + path+')');
									progressIndicator.remove();
									commit('/photos/get/' + path);
								});
							}
						}
					}
				});

				var ngModel = ctrls[0];
				if (ngModel) {
					ngModel.$render = function() {
						elm.css('background-image', 'url('+(ngModel.$viewValue || 'img/no_photo.jpg')+')');
					};

					commit = function(val) {
						scope.$apply( function() {
							ngModel.$setViewValue(val);
						});
					};
				}

				// if (attrs.xpsuiSchema) {
				// 	var schema = scope.$eval(attrs.xpsuiSchema);
				// }
				
			}
		}
	}]);

}(window.angular));