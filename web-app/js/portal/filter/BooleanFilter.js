/*
 * Copyright 2015 IMOS
 *
 * The AODN/IMOS Portal is distributed under the terms of the GNU General Public License
 *
 */

Ext.namespace('Portal.filter');

Ext.define('Portal.filter.BooleanFilter', { extend: 'Portal.filter.Filter',

    getSupportedGeoserverTypes: function() {

        return ['boolean'];
    },

    getUiComponentClass: function() {

        return Portal.filter.ui.BooleanFilterPanel;
    },

    getCql: function() {

        return String.format(
            '{0} = true',
            this.getName()
        );
    },

    getHumanReadableForm: function() {

        return String.format(
            '{0}: true',
            this.getLabel()
        );
    }
});
