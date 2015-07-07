/*
 * Copyright 2015 IMOS
 *
 * The AODN/IMOS Portal is distributed under the terms of the GNU General Public License
 *
 */

Ext.namespace('Portal.filter.combiner');

Ext.define('Portal.filter.combiner.BodaacCqlBuilder', { extend: 'Portal.filter.combiner.FilterCqlBuilder',

    buildCql: function() {

        var cqlParts = this._visualisedFiltersWithValues().map(function(filter) {

            return filter.getCql();
        });

        return this._joinCql(cqlParts);
    }
});
