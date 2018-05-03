Ext.namespace('Portal.filter');

Portal.filter.ALASpeciesStringArrayFilter = Ext.extend(Portal.filter.Filter, {

    getSupportedGeoserverTypes: function() {

        return ['alastringarray'];
    },

    getUiComponentClass: function() {

        return Portal.filter.ui.ComboFilterPanel;
    },

    // not cql for ALA
    getCql: function() {
        var filterString = this._join(this._getFilterStrings(), " OR ");
        return {"Q": filterString}
    },

    isVisualised: function() {
        return true;
    },

    getHumanReadableForm: function() {

        return String.format(
            '{0}: {1}',
            this.getLabel(),
            this._join(this._getFilterStrings(true), " OR ")
        );
    },

    // todo better options for text filtering?
    // text sometimes fails due to non alpha numeric
    _getFilterValueString: function(filterData) {
        return (filterData.guid.startsWith("urn")) ? "lsid:" + filterData.guid : "text:" + filterData.name;
    },

    _join: function(parts, joiner) {
        return parts.length > 0 ? parts.join(joiner) : null;
    },

    getHumanReadableDescriptor: function(item) {
        var commonName = (item.commonName != "") ? String.format("'{0}'", item.commonName) : "";
        return String.format("{0} - {1} {2}", Ext.util.Format.capitalize(item.rankString), item.name, commonName);
    },

    _getFilterStrings: function(humanReadable) {

        var returnParameters = [];
        var that = this;

        Ext.each(this.getValue(), function(item) {
            if (humanReadable) {
                returnParameters.push(that.getHumanReadableDescriptor(item));
            }
            else {
                returnParameters.push(that._getFilterValueString(item))
            }
        });

        return returnParameters;
    }
});
