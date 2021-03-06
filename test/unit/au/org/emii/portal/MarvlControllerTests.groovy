package au.org.emii.portal

import grails.test.mixin.TestFor

@TestFor(MarvlController)
class MarvlControllerTests {

    void setUp() {
        controller.grailsApplication.config =
            new ConfigSlurper().parse(
                """
                marvl {
                    urlList {
                        substitutions = [
                            '/mnt/files/': 'http://data.imos.org.au/'
                        ]
                    }
                }"""
            )
    }

    void testUrlListForFeatureRequest() {

        controller.params.propertyName = "the_property"

        def testParamProcessor = new Object()
        controller.metaClass.requestSingleFieldParamProcessor = { fieldName ->
            assertEquals "the_property", fieldName
            return testParamProcessor
        }

        def performProxyingCalledCount = 0
        controller._performProxyingIfAllowed = { paramProcessor, streamProcessor ->

            performProxyingCalledCount++

            assertEquals testParamProcessor, paramProcessor
            _verifyStreamProcessor(streamProcessor)
        }

        controller.urlListForFeatureRequest()

        assertEquals 1, performProxyingCalledCount
    }

    void _verifyStreamProcessor(processor) {

        def input = """\
            FID,the_property
            aatams_sattag_nrt_wfs.331443,/mnt/files/IMOS/Q9900542.nc
        """

        def expectedOutput = """\
http://data.imos.org.au/IMOS/Q9900542.nc\n\
"""

        def inputStream = new ByteArrayInputStream(input.bytes)
        def outputStream = new ByteArrayOutputStream()

        processor(inputStream, outputStream)

        assertEquals expectedOutput, outputStream.toString("UTF-8")
    }

    void testUrlListForFeatureRequestPropertyNameMissing() {

        controller.urlListForFeatureRequest()

        assertEquals "No propertyName provided", response.contentAsString
    }
}
