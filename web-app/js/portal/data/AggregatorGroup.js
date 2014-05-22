/*
 * Copyright 2014 IMOS
 *
 * The AODN/IMOS Portal is distributed under the terms of the GNU General Public License
 *
 */

Ext.namespace('Portal.data');

Portal.data.AggregatorGroup = Ext.extend(Object, {

    childAggregators: null,

    constructor: function() {
        this.childAggregators = [];
    },

    add: function(aggr) {
        this.childAggregators.push(aggr);
    },

    supportsSubsettedNetCdf: function() {

        for (var i = 0; i < this.childAggregators.length; i++) {
            if (this.childAggregators[i].supportsSubsettedNetCdf()) {
                return true;
            }
        }

        return false;
    },

    supportsNetCdfUrlList: function() {

        for (var i = 0; i < this.childAggregators.length; i++) {
            if (this.childAggregators[i].supportsNetCdfUrlList()) {
                return true;
            }
        }

        return false;
    },

    hasChildAggregators: function() {

        return this.childAggregators.length > 0;
    },

    getRecordAggregator: function() {

        var recordAggregator;

        Ext.each(this.childAggregators, function(aggr) {
            if (aggr.supportsSubsettedNetCdf()) {
                recordAggregator = aggr;
            }
        });

        return recordAggregator;
    }
});