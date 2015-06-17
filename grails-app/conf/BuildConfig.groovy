
/*
 * Copyright 2012 IMOS
 *
 * The AODN/IMOS Portal is distributed under the terms of the GNU General Public License
 *
 */

grails.project.class.dir = "target/classes"
grails.project.test.class.dir = "target/test-classes"
grails.project.test.reports.dir = "target/test-reports"
grails.project.war.file = "target/${appName}-${appVersion}-${grails.util.Environment.current.name}.war"

grails.project.plugins.dir = "./plugins"

grails.project.dependency.resolution = {
    // inherit Grails' default dependencies
    inherits("global") {
        // uncomment to disable ehcache
        // excludes 'ehcache'
		excludes "xml-apis"
		excludes("catalina")
    }
    log "warn" // log level of Ivy resolver, either 'error', 'warn', 'info', 'debug' or 'verbose'
    repositories {
        grailsHome()
        mavenLocal()
        mavenCentral()
        mavenRepo "http://download.java.net/maven/2/"
        mavenRepo "https://repo.grails.org/grails"
        mavenRepo "https://repo.grails.org/grails/plugins"
    }
    dependencies {
        // specify dependencies here under either 'build', 'compile', 'runtime', 'test' or 'provided' scopes eg.
        compile "javax.mail:mail:1.4.2"
        test ":build-test-data:1.1.2"
    }
	
	// Allow grails commands to be run as usual, see: http://grails.org/doc/latest/guide/conf.html#mavenIntegration
	pom true
	plugins {
        test ":code-coverage:2.0.3-3"
	}
}

coverage {
    enabledByDefault = false
    xml = true
}

grails.war.resources = { stagingDir ->
    
	delete(file:"${stagingDir}/WEB-INF/lib/catalina-6.0.32.jar")
	delete(file:"${stagingDir}/WEB-INF/lib/servlet-api-2.5.jar")
	delete(file:"${stagingDir}/WEB-INF/lib/servlet-api-6.0.32.jar")

    // The jars are being inserted by the hudson/tomcat build process, and
    // are causing errors on startup for the app on tomcat6.
    delete(file:"${stagingDir}/WEB-INF/lib/commons-collections-3.1.jar")
    delete(file:"${stagingDir}/WEB-INF/lib/slf4j-api-1.5.2.jar")
}
