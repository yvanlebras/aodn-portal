package au.org.emii.portal.scanner

import grails.test.*
import groovy.mock.interceptor.MockFor
import au.org.emii.portal.Server

class WfsScannerServiceTests extends GrailsUnitTestCase {
    def wfsScannerService

    protected void setUp() {
        super.setUp()
        wfsScannerService = new WfsScannerService()

        //grailsApplication.config.wfsScanner.url
        wfsScannerService.grailsApplication = [
                config: [
                        wfsScanner: [
                                url: "http://blah.au"
                        ]
                ]
        ]
    }

    void testDeleteJob(){
        def count = 0

        wfsScannerService.metaClass.callService = { address ->
            assertEquals address, "http://blah.au/scanJob/delete?id=3"
            count++
        }

        assertEquals wfsScannerService.callDelete(3), "Job deleted."
        assertEquals count, 1
    }

    void testRegister(){
        def server = [
                id: 1,
                scanFrequency: 120,
                password: "somePassword",
                uri: "http://geoserver.blah.com",
                type: "GEO-1.1.1"
        ]  as Server

        mockDomain(Server, [server])

        wfsScannerService.metaClass.saveOrUpdateCallbackUrl = {
            return "http://localhost/filter/updateFilter"
        }

        wfsScannerService.metaClass.scanJobUrl = {
            return "http://scannerHost.com/scanJob/"
        }

        def count = 0

        wfsScannerService.metaClass.callService = { address ->
            assertEquals address, "http://scannerHost.com/scanJob/register?serverUrl=http://geoserver.blah.com&layerName=abc&callbackUrl=http://localhost/filter/updateFilter&password=somePassword&scanFrequency=120"
            count++
        }

        wfsScannerService.callRegister(1, "abc", "somePassword")

        assertEquals count, 1
    }


    void testUpdate(){

        wfsScannerService.metaClass.scanJobUrl = {
            return "http://scannerHost.com/scanJob/"
        }

        def count = 0

        wfsScannerService.metaClass.callService = { address ->
            assertEquals address, "http://scannerHost.com/scanJob/updateNow?id=100"
            count++
        }

        wfsScannerService.callUpdate(100)

        assertEquals count, 1
    }

}
