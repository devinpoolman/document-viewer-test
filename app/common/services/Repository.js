'use strict';

angular.module('doctestApp')
  .factory('Repository', function () {
    var Repository = function (entityClass, cache) {
        this.entityClass = entityClass;
        this.cache = cache;
    };

    Repository.prototype.cached = function(keyPrefix, func, hasher) {
        hasher || (hasher = _.identity);

        return function() {
            var key = keyPrefix + '-' + hasher.apply(this, arguments);
            var cachedResult = this.cache.get(key);

            if (cachedResult) {
                return cachedResult;
            } else {
                var result = func.apply(this, arguments);
                this.cache.put(key, result);
                return result;
            }
        };
    };

    Repository.prototype.invalidateCache = function() {
        this.cache.removeAll();
    };

    /**
     * Queries the database for a list of the specified entity
     * @param [queryCollection]
     * @param callback
     */
    Repository.prototype.list = function (queryCollection, callback) {
        var self = this;

        if (_.isFunction(queryCollection)) {
            callback = queryCollection;
            queryCollection = undefined;
        }

        if (_.isUndefined(queryCollection)) {
            queryCollection = self.entityClass.all();
        }

        var result = [];

        queryCollection.list(function (results) {
            persistence.clean();
            results.forEach(function (item) {
                result.push(item._data);
            });

            if (_.isFunction(callback)) {
                callback.apply(this, [result]);
            }
        });
    };

    return Repository;
  });
