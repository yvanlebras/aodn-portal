package au.org.emii.portal

class MetadataUrl {

    String type
    String format

    OnlineResource onlineResource

    static embedded = [ "onlineResource" ]

    static constraints = {}

    MetadataUrl() {

        onlineResource = new OnlineResource()
    }

    @Override
    public String toString() {
        return "MetadataUrl { type: '$type'; format: '$format'; OnlineResource { type: '$onlineResource.type'; href: '$onlineResource.href' } }";
    }
}

class OnlineResource {

    String type
    String href
}