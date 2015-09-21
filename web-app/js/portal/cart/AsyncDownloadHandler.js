Ext.namespace('Portal.cart');

Portal.cart.AsyncDownloadHandler = Ext.extend(Portal.cart.DownloadHandler, {

    getAsyncDownloadUrl: function(aggregatorServiceName) {
        return String.format('asyncDownload?aggregatorService={0}&', aggregatorServiceName);
    },

    getDownloadOptions: function(textKey) {

        var downloadOptions = [];

        if (this._hasRequiredInfo()) {

            downloadOptions.push({
                textKey: textKey,
                handler: this._getUrlGeneratorFunction(),
                handlerParams: {
                    asyncDownload: true,
                    collectEmailAddress: true,
                    serviceResponseHandler: this.serviceResponseHandler
                }
            });
        }
        return downloadOptions;
    },

    _hasRequiredInfo: function() {
        return this._resourceHrefNotEmpty() && this._resourceNameNotEmpty();
    },

    serviceResponseHandler: function(response) {
        var msg = "";

        if (response) {
            try {
                var responseJson = JSON.parse(response);
                if (responseJson['url']) {
                    msg = OpenLayers.i18n('asyncServiceMsg', {
                        url: responseJson['url']
                    });
                }
            }
            catch (e) {
                log.error(String.format("Could not parse asynchronous response: '{0}'", response));
            }
        }
        return msg;
    }
});
