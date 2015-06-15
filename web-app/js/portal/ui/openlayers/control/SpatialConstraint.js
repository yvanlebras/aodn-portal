/*
 * Copyright 2013 IMOS
 *
 * The AODN/IMOS Portal is distributed under the terms of the GNU General Public License
 *
 */
Ext.namespace('Portal.ui.openlayers.control');

Portal.ui.openlayers.SpatialConstraintType = {
    POLYGON: 'polygon',
    BOUNDING_BOX: 'bounding box'
};

Portal.ui.openlayers.control.SpatialConstraint = Ext.extend(OpenLayers.Control.DrawFeature, {

    SPATIAL_EXTENT_ERROR_TIMEOUT: 1200,
    MIN_AREA_PERCENT: 0.01,
    errorStyle: {
        fillOpacity: 0.3,
        strokeOpacity: 0.5,
        strokeDashstyle: "dashdot",
        fillColor: "#FF0300",
        strokeColor: "#FF0300"
    },

    constructor: function(options) {

        this.layerName = 'spatial constraint';

        options = options || {};

        this.layer = new OpenLayers.Layer.Vector(
            this.layerName,
            {
                displayInLayerSwitcher: false
            }
        );

        var handler = options.handler || OpenLayers.Handler.RegularPolygon;
        options.handlerOptions =
            options.handlerOptions || {
                sides: 4,
                irregular: true
            };

        options.autoActivate = options.autoActivate || true;

        OpenLayers.Control.DrawFeature.prototype.initialize.apply(this, [this.layer, handler, options]);

        this._configureEventsAndHandlers();

        if (options.initialConstraint) {
            this.layer.addFeatures(new OpenLayers.Feature.Vector(options.initialConstraint));
            this.events.triggerEvent('spatialconstraintadded');
            trackFiltersUsage('filtersTrackingSpatialConstraintAction', OpenLayers.i18n('trackingInitLabel'));
        }

        this._isModified = false;
    },

    _configureEventsAndHandlers: function() {
        this.events.addEventType('spatialconstraintadded');
        this.events.addEventType('spatialconstraintcleared');
        this.events.addEventType('spatialconstrainttypechanged');

        this.layer.events.on({
            scope: this,
            "sketchstarted": this._onSketchStarted,
            "sketchcomplete": this._onSketchComplete
        });
    },

    _onSketchStarted: function() {
        this.layer.style = OpenLayers.Feature.Vector.style['default'];
    },

    setMap: function(map) {
        map.addLayer(this.layer);
        return OpenLayers.Control.DrawFeature.prototype.setMap.apply(this, arguments);
    },

    removeFromMap: function() {
        this.deactivate();
        this._removeMapEvents();
        this.map.removeLayer(this.layer);
        this.map.removeControl(this);
    },

    clear: function() {
        this.layer.destroyFeatures();
        this._isModified = true;
    },

    redraw: function(geometry) {
        this.oldGeometry = geometry;
        this.clear();
        this.layer.addFeatures(new OpenLayers.Feature.Vector(geometry));
        this.events.triggerEvent('spatialconstraintadded', geometry);
    },

    isModified: function() {
        return this._isModified;
    },

    hasConstraint: function() {
        return this._getFeature() != undefined;
    },

    getConstraint: function() {
        if (this.hasConstraint()) {
            return this.getNormalizedGeometry(this._getFeature().geometry);
        }
    },

    getConstraintAsWKT: function() {
        if (this.hasConstraint()) {
            return this._getFeature().geometry.toWkt();
        }
    },

    _removeMapEvents: function() {
        this.map.events.un({
            "changelayer": this._layerChanged
        });

        this.map.events.un({
            "removelayer": this._layerRemoved
        });
    },

    _layerAdded: function(addLayerEvent) {
        this._setDrawingLayersToTop();
    },

    _layerChanged: function(layer, property) {
        this._setDrawingLayersToTop();
    },

    _layerRemoved: function(layer) {
        this._setDrawingLayersToTop();
    },

    _setDrawingLayersToTop: function() {
        // Set drawing layer and polygon layer to be on top of any layer in
        // terms of Z index
        var maxZIndexForOverlay = OpenLayers.Map.prototype.Z_INDEX_BASE['Feature'] - 1;

        if (this.handler && this.handler.layer) {
            this.handler.layer.setZIndex(maxZIndexForOverlay - 1);
        }
        this.layer.setZIndex(maxZIndexForOverlay);
    },

    _getFeature: function() {
        // Contains geometry that is not normalised
        return this.layer.features[0];
    },

    isGeometryLargeEnough: function(geometry) {
        var area = geometry.getArea();
        return this._getPercentOfViewportArea(area) > this.MIN_AREA_PERCENT;
    },

    _checkSketch: function(feature) {
        var geometry = feature.geometry;

        return this.isGeometryLargeEnough(geometry) && !geometry.crossesDateLine();
    },

    _showSpatialExtentError: function(geometry) {
        this.layer.style = this.errorStyle;

        if (this.isGeometryLargeEnough(geometry)) {
            this.addAntimeridian();
        }

        // Reset to previous geom after a short time
        var that = this;

        setTimeout(function() {
            if (that.oldGeometry) {
                that.events.triggerEvent('spatialconstraintadded', that.oldGeometry);
                that.layer.style = OpenLayers.Feature.Vector.style['default'];
                that.redraw(that.oldGeometry);
            }
            else {
                that.map.events.triggerEvent('spatialconstraintcleared');
            }
        }, this.SPATIAL_EXTENT_ERROR_TIMEOUT);
    },

    addAntimeridian: function() {
        var meridianLine = new OpenLayers.Geometry.LineString([
            new OpenLayers.Geometry.Point(180, -90),
            new OpenLayers.Geometry.Point(180, 90)
        ]);
        var meridianLineFeature = new OpenLayers.Feature.Vector(meridianLine, null, this.errorStyle);
        this.layer.addFeatures([meridianLineFeature]);
    },

    _onSketchComplete: function(event) {
        this.clear();
        var geometry = event.feature.geometry;

        if (this._checkSketch(event.feature)) {
            var normalisedGeometry = this.getNormalizedGeometry(geometry);
            this.events.triggerEvent('spatialconstraintadded', normalisedGeometry);
            this.oldGeometry = normalisedGeometry;
            trackFiltersUsage('filtersTrackingSpatialConstraintAction', OpenLayers.i18n('trackingSpatialConstraintSketched'));
        }
        else {
            this._showSpatialExtentError(geometry);

            return true; // Let the features to be added to the layer
        }
    },

    getNormalizedGeometry: function(geometry) {
        return new OpenLayers.Geometry.fromWKT(geometry.toWkt());
    },

    _getPercentOfViewportArea: function(spatialExtentArea) {
        var mapArea = this._getMapArea();
        return (spatialExtentArea / parseFloat(mapArea)) * 100;
    },

    _getMapArea: function() {
        return this.map.getExtent().toGeometry().getArea();
    }
});

Portal.ui.openlayers.control.SpatialConstraint.createAndAddToMap = function(map, handler) {
    map.spatialConstraintControl = new Portal.ui.openlayers.control.SpatialConstraint({
        handler: handler,
        'displayClass': 'none'
    });

    map.addControl(map.spatialConstraintControl);

    map.events.on({
        scope: map.spatialConstraintControl,
        "addlayer": map.spatialConstraintControl._layerAdded
    });

    map.events.on({
        scope: map.spatialConstraintControl,
        "changelayer": map.spatialConstraintControl._layerChanged
    });

    map.events.on({
        scope: map.spatialConstraintControl,
        "removelayer": map.spatialConstraintControl._layerRemoved
    });

    map.spatialConstraintControl.events.on({
        scope: map,
        "spatialconstraintadded": function(geometry) {
            this.events.triggerEvent('spatialconstraintadded', geometry);
        }
    });
};
