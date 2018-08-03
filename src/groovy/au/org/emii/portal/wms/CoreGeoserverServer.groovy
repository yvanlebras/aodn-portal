package au.org.emii.portal.wms

class CoreGeoserverServer extends WmsServer {
    protected def utils = new CoreGeoserverUtils()

    private def filterValuesService

    CoreGeoserverServer(filterValuesService) {
        this.filterValuesService = filterValuesService
    }

    def getStyles(server, layer) {
        return []
    }

    def getFilters(server, layer) {
        def filters = []

        def layerInfo = utils.getLayerInfo(server, layer)

        if (layerInfo.owsType == "WCS") {

            filters.push(
                [
                    label           : 'Bounding Box',
                    type            : 'geometrypropertytype',
                    name            : 'position',
                    visualised      : false
                ]
            )
        }
        else {

            try {

                def xml = new XmlSlurper().parseText(utils._describeFeatureType(server, layer))

                def attributes = xml.'**'.findAll { node ->
                    node.name() == 'element' && node.@name != _removePrefix(layer)
                }

                boolean hasTemporalRange = false

                attributes.each { attribute ->
                    def propertyName = attribute.@name.text()
                    def propertyType = attribute.@type.text()

                    if (['time_coverage_start', 'time_coverage_end'].contains(propertyName)) {
                        // handle IMOS convention of mapping temporal range to single 'TIME'
                        // property on WFS featureType
                        if (!hasTemporalRange) {
                            filters.push(
                                [
                                    label     : 'Time',
                                    type      : 'datetime',
                                    name      : 'TIME',
                                    visualised: true,
                                    wmsStartDateName: 'time_coverage_start',
                                    wmsEndDateName: 'time_coverage_end'
                                ]
                            )
                            hasTemporalRange = true
                        }
                    }
                    else {
                        filters.push(
                            [
                                label     : _toLabel(propertyName),
                                type      : _toFilterType(propertyType),
                                name      : propertyName,
                                visualised: true
                            ]
                        )
                    }
                }
            }
            catch (e) {
                log.error "Unable to parse filters for server '${server}', layer '${layer}'", e
            }
        }

        return filters
    }

    def getFilterValues(Object server, Object layer, Object filter) {
        return filterValuesService.getFilterValues(layer, filter)
    }

    def _toFilterType(value) {
        _removePrefix(value.toLowerCase())
    }

    def _removePrefix(value) {
        value - ~/^.*:/
    }

    def _toLabel(attributeName) {
        attributeName.replaceAll('_', ' ').toLowerCase()
    }

}
