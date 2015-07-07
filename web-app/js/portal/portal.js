/*
 * Copyright 2012 IMOS
 *
 * The AODN/IMOS Portal is distributed under the terms of the GNU General Public License
 *
 */

var viewport;
var progressCount = 0;

Ext.state.Manager.setProvider(new Ext.state.CookieProvider()); // Used by aggregate download
Ext.BLANK_IMAGE_URL = 'img/blank.gif';
Ext.QuickTips.init();

//--------------------------------------------------------------------------------------------
Ext.ns('Portal');

Portal.app = {

    ajaxComplete: function() {
        progressCount--;
        if (progressCount <= 0) {
            progressCount = 0;
            this.ajaxAction('hide');
        }
    },

    browserCheck: function() {
        var supported = false; // exclusive
        var isChrome = !!window.chrome;
        var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0

        var agent = navigator.userAgent.toLowerCase();
        var isIOS = /(ipad|iphone|ipod)/g.test(agent);
        var isAndroid = (agent.indexOf("android") > -1 && agent.indexOf("mobile") > -1);

        if (isChrome || isFirefox ) {  supported = true; }
        if (isIOS || isAndroid)     { supported = false;}

        if (!supported) {
            alert(OpenLayers.i18n('unsupportedWarningMessage'));
        }
    },

    init: function() {
        // Set open layers proxyhost
        OpenLayers.ProxyHost = Ext.ux.Ajax.proxyUrl;

        // Global Ajax events can be handled on every request!
        Ext.Ajax.on('beforerequest', function() {
            if (progressCount == 0) {
                this.ajaxAction('show');
            }
            progressCount++;
        }, this);

        Ext.Ajax.on('requestcomplete', this.ajaxComplete, this);
        Ext.Ajax.on('requestexception', this.ajaxComplete, this);

        // Load config
        Ext.Ajax.request({
            url: 'home/config',
            scope: this,
            success: this.afterConfigLoad,
            failure: this.configLoadFailed
        });
    },

    afterConfigLoad: function(resp) {

        var configJson = resp.responseText;

        try {
            this.appConfig = Ext.JSON.decode(configJson);
        }
        catch (e) {
            log.error('Unable to load config. Invalid response: ' + configJson);
            this._displayPortalLoadError();
        }

        viewport = new Portal.ui.Viewport({
            appConfig: Portal.app.appConfig
        });
    },

    configLoadFailed: function(resp) {
        log.error("Unable to load '" + resp.responseText + "' (status: " + resp.status + ")" );
        this._displayPortalLoadError();
    },

    _displayPortalLoadError: function() {
        Ext.MessageBox.alert('Error', 'There was a problem loading the Portal.<br>Refreshing the page may resolve the problem.');
    },

};

// sets the tab from the external links in the header
function setViewPortTab(tabIndex) {
    viewport.setActiveTab(tabIndex);
}
