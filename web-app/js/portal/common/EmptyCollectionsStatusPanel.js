/*
 * Copyright 2012 IMOS
 *
 * The AODN/IMOS Portal is distributed under the terms of the GNU General Public License
 *
 */

Ext4.namespace('Portal.common');

Ext4.define('Portal.common.EmptyCollectionStatusPanel', { extend: 'Ext4.Container',

    constructor: function(cfg) {
        Ext4.apply(this, cfg);
        this.callParent();
    },

    initComponent: function(cfg) {
        var config = Ext4.apply({
            html: this.toString(),
            cls: 'x-panel-header'
        }, cfg);

        Ext4.apply(this, config);
        this.callParent();
    },

    toString: function() {
        return "<div class=\"message\" >" +
            OpenLayers.i18n('noActiveCollectionSelected') +
            "<p>" + OpenLayers.i18n('noCollectionSelectedHelp') +
            "</p></div>"
    }
});
