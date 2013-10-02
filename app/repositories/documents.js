'use strict';

angular.module('doctestApp')
  .factory('DocumentsRepository', ['$q', '$rootScope', '$cacheFactory', 'Repository', function ($q, $rootScope, $cacheFactory, Repository) {

	var Documents = persistence.define('documents', {
		name: 'TEXT',
		file: 'TEXT'
	});
	persistence.schemaSync();

	var DocumentsRepository = new Repository(Documents,$cacheFactory('DocumentsRepository'));
    
    DocumentsRepository.listAll = DocumentsRepository.cached('listAll',
    	function() {
    		var deferred = $q.defer();

    		this.list(function (items) {
    			$rootScope.$apply(function() {
                    deferred.resolve(items);
                });
            });

            return deferred.promise; 
    	}
    );

    $rootScope.$on('appgluSyncCompleted', function () {
        DocumentsRepository.invalidateCache();
    });

    return DocumentsRepository;

}]);