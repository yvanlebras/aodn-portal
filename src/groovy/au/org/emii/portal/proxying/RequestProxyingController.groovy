/*
 * Copyright 2013 IMOS
 *
 * The AODN/IMOS Portal is distributed under the terms of the GNU General Public License
 *
 */

package au.org.emii.portal.proxying

import static au.org.emii.portal.HttpUtils.buildAttachmentHeaderValueWithFilename

abstract class RequestProxyingController {

    def index = {

        _performProxying()
    }

    def _performProxying = { paramProcessor = null, streamProcessor = null ->

        log.debug "proxying url: ${params.url}"

        def url = params.url

        if (!url) {
            render text: "No URL supplied", contentType: "text/html", encoding: "UTF-8", status: 400
        }
        // Send a mock hierarchical response until such time as we can send a real one.
        else if (_isGeoNetworkSearchRequest(url) && grailsApplication.config.featureToggles?.hierarchicalFacets) {
            render(
                text: new File("test/integration/au/org/emii/portal/proxying/MockGeoNetworkResponse.xml").text,
                contentType: "text/xml",
                encoding: "UTF-8"
            )
        }
        else if (!hostVerifier.allowedHost(request, url)) {
            log.info "Proxy: The url $url was not allowed"
            render text: "Host for address '$url' not allowed", contentType: "text/html", encoding: "UTF-8", status: 400
        }
        else {
            def processedParams = paramProcessor ? paramProcessor(params) : params

            // Use download filename if provided
            _setDownloadFilename(response, params)

            // Make request
            def proxiedRequest = new ProxiedRequest(request, response, processedParams)
            proxiedRequest.proxy(streamProcessor)
        }
    }

    def _isGeoNetworkSearchRequest(url) {
        return url.startsWith("${grailsApplication.config.geonetwork.url}/srv/eng/xml.search.summary")
    }

    def _setDownloadFilename(response, params) {

        def downloadFilename = params.remove('downloadFilename')
        if (downloadFilename) {
            log.debug "Download filename is '${downloadFilename}'. Forcing download."
            response.setHeader("Content-disposition", buildAttachmentHeaderValueWithFilename(downloadFilename))
        }
    }
}
