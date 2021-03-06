Ext.namespace('Portal.filter.ui');

Portal.filter.ui.FilterGroupPanel = Ext.extend(Portal.filter.ui.GroupPanel, {

    _filtersLoaded: function(filters) {
        var filterPanels = [];
        var filterService = new Portal.filter.FilterService();
        this._sortFilters(filters);

        Ext.each(filters, function(filter) {

            var filterPanel = this._createFilterPanel(filter);

            filterPanels.push(filterPanel);

            if (filterPanel.needsFilterRange()) {

                filterService.loadFilterRange(
                    filter.getName(),
                    this.dataCollection,
                    this.createSafeCallback(function(filterRange) {
                        filterPanel.setFilterRange(filterRange);
                    }),
                    this.createSafeCallback(function() {
                        filterPanel.setFilterRange([]);
                    }),
                    this
                );
            }
        }, this);

        this.filterPanels = filterPanels;

        this._organiseFilterPanels(filterPanels);

        if (this.filterPanels.length > 0) {
            this._updateAndShow();
        }
        else {
            this._handleFilterLoadFailure();
        }

        Ext.MsgBus.publish(PORTAL_EVENTS.DATA_COLLECTION_MODIFIED, this.dataCollection);

    },

    _filtersUpdated: function() {

        var wfsMapLayerCheckUrl = this._getFeatureUrlGeneratorFunction();
        if (wfsMapLayerCheckUrl.includes("CQL_FILTER")) {
            Ext.Ajax.request({
                url: Ext.ux.Ajax.constructProxyUrl(wfsMapLayerCheckUrl),
                scope: this,
                success: this._handleGetFeatureRequestResults
            });
        }
        else {
            delete(this.dataCollection.totalFilteredFeatures);
            this._handleEmptyDownloadMsg();
        }
    },

    _handleGetFeatureRequestResults: function(results) {
        if (results.status == 200) {
            var res = Ext.util.JSON.decode(results.responseText);
            var featureCount = res.totalFeatures;
            if (featureCount == "unknown") {
                featureCount = res.features.length;
            }
            this.dataCollection.totalFilteredFeatures = (res && featureCount >= 0) ? featureCount : undefined;
        }
        else {
            this.dataCollection.totalFilteredFeatures = undefined;
        }
        this._handleEmptyDownloadMsg();

    },

    _handleEmptyDownloadMsg: function() {
        if (this.isDestroyed !== true) {
            var show = (this.dataCollection.totalFilteredFeatures != undefined && this.dataCollection.totalFilteredFeatures == 0);
            this.warningEmptyDownloadMessage.setVisible(show);
        }
    },

    // uses the WMS map layer
    _getFeatureUrlGeneratorFunction: function() {

        var builder = new Portal.filter.combiner.MapCqlBuilder({
            filters: this.dataCollection.getFilters()
        });

        var url = OpenLayers.Layer.WMS.buildGetFeatureInfoRequestUrl(
            this.dataCollection.layerSelectionModel.selectedLayer.url,
            this.dataCollection.layerSelectionModel.selectedLayer.wmsName.split('#')[0],
            "application/json",
            builder.buildCql()
        );

        return url;
    }
});
