/*
 * Copyright 2013 IMOS
 *
 * The AODN/IMOS Portal is distributed under the terms of the GNU General Public License
 *
 */
Ext4.namespace('Portal.cart');

Ext4.define('Portal.cart.DownloadPanel', { extend: 'Ext4.Container',

    initComponent: function(cfg) {
        this.bodyContent = Ext4.create('Ext4.Container', {
            cls: 'downloadPanelItem',
            width: 1024
        });
        this.initButtonPanel();

        this.emptyMessage = Ext4.create('Portal.common.EmptyCollectionStatusPanel');

        var config = Ext4.apply({
            autoScroll: true,
            title: OpenLayers.i18n('stepHeader', { stepNumber: 3, stepDescription: OpenLayers.i18n('step3Description')}),
            headerCfg: {
                cls: 'steps'
            },
            bodyCfg: {
                cls: 'downloadPanelBody'
            },
            items: [
                { // TODO ext4 remove once DownloadPanel is Ext4.Panel again
                    xtype: 'label',
                    html: OpenLayers.i18n('stepHeader', { stepNumber: 3, stepDescription: OpenLayers.i18n('step3Description')}) ,
                    cls: 'steps'
                },
                { xtype: 'tbspacer', height: 10 },
                this.buttonPanel,
                { xtype: 'tbspacer', height: 10 },
                this.emptyMessage,
                this.bodyContent
            ]
        }, cfg);

        this.store = Portal.data.ActiveGeoNetworkRecordStore.instance();
        this.confirmationWindow = Ext4.create('Portal.cart.DownloadConfirmationWindow');

        Ext4.apply(this, config);
        this.callParent();

        this.downloader = this._initDownloader();
        this._registerEvents();
    },

    _initDownloader: function() {
        return new Portal.cart.Downloader({
            listeners: {
                'downloadrequested': function(downloadUrl, collection) {
                    this.onDownloadRequested(downloadUrl, collection);
                },
                'downloadstarted': function(downloadUrl, collection) {
                    this.onDownloadStarted(downloadUrl, collection);
                },
                'downloadfailed': function(downloadUrl, collection, msg) {
                    this.onDownloadFailed(downloadUrl, collection, msg);
                },
                scope: this
            }
        });
    },

    _registerEvents: function() {
        Ext4.MsgBus.subscribe(PORTAL_EVENTS.TAB_CHANGED, function() { this.generateContent() }, this);
        Ext4.MsgBus.subscribe(PORTAL_EVENTS.DATA_COLLECTION_ADDED, function() { this.generateContent() }, this);
        Ext4.MsgBus.subscribe(PORTAL_EVENTS.DATA_COLLECTION_MODIFIED, function() { this.generateContent() }, this);
        Ext4.MsgBus.subscribe(PORTAL_EVENTS.DATA_COLLECTION_REMOVED, function() { this.generateContent() }, this);
    },

    onDownloadRequested: function(downloadUrl, collection) {
        log.debug('Download requested', downloadUrl, collection);
        this.generateContent();
    },

    onDownloadStarted: function(downloadUrl, collection) {
        log.debug('Download started', downloadUrl, collection);
        this.generateContent();
    },

    onDownloadFailed: function(downloadUrl, collection, msg) {
        Ext4.Msg.alert(
            OpenLayers.i18n('errorDialogTitle'),
            OpenLayers.i18n('downloadErrorText')
        );
        log.error('Download failed', downloadUrl, collection, msg);
        this.generateContent();
    },

    generateContent: function() {
        if (this.rendered && viewport.isOnTab(TAB_INDEX_DOWNLOAD)) {
            this.generateBodyContent();
        }
    },

    generateBodyContent: function() {
        var tpl = new Portal.cart.DownloadPanelItemTemplate(this);
        var html = '';

        Ext4.each(this.store.getLoadedRecords(), function(item) {
            var collection = item.data;

            html += this._generateBodyContentForCollection(tpl, collection, html);
        }, this);

        if ("" == html) {
            this.buttonPanel.hide();
            this.emptyMessage.show();
        }
        else {
            this.emptyMessage.hide();
            this.buttonPanel.show();
        }

        this.bodyContent.update(html);
    },

    _generateBodyContentForCollection: function(tpl, collection, html) {
        var service = new Portal.cart.InsertionService(this);
        var processedValues = service.insertionValues(collection);

        this._loadMenuItemsFromHandlers(processedValues, collection);

        return this._applyTemplate(tpl, processedValues);
    },

    _applyTemplate: function(tpl, values) {
        return tpl.apply(values);
    },

    initButtonPanel: function () {
        this.resetAllButton = Ext4.create('Ext4.Button', {
            text: OpenLayers.i18n("clearLinkLabel", {text: OpenLayers.i18n('clearAndResetLabel')}),
            tooltip: OpenLayers.i18n("clearAllButtonTooltip"),
            cls: "clearFiltersLink buttonPad",
            handler: this._clearAllAndReset
        });

        this.buttonPanel = new Ext4.Panel({
            cls: 'downloadPanelItem',
            width: 1024,
            items: [ this.resetAllButton ]
        });
    },

    _clearAllAndReset: function () {

        Portal.data.ActiveGeoNetworkRecordStore.instance().removeAll();
        setViewPortTab(0);
    },

    _loadMenuItemsFromHandlers: function(processedValues, collection) {

        if (!processedValues.menuItems) {
            processedValues.menuItems = [];
        }

        Ext4.each(collection.dataDownloadHandlers, function(handler) {

            Ext4.each(handler.getDownloadOptions(), function(downloadOption) {

                var newMenuItem = {
                    text: OpenLayers.i18n(downloadOption.textKey),
                    handler: function() {
                        this.confirmDownload(collection, this, downloadOption.handler, downloadOption.handlerParams, downloadOption.textKey)
                    },
                    scope: this
                };

                processedValues.menuItems.push(newMenuItem);
            }, this);
        }, this);
    },

    confirmDownload: function(collection, generateUrlCallbackScope, generateUrlCallback, params, textKey) {

        var self = this;

        params.onAccept = function(callbackParams) {
            self.downloader.download(collection, generateUrlCallbackScope, generateUrlCallback, callbackParams);
            trackDownloadUsage(
                OpenLayers.i18n('downloadTrackingActionPrefix') + OpenLayers.i18n(textKey),
                collection.title,
                undefined
            );
        };

        this.confirmationWindow.show(params);
    }
});
