(() => {
    const badParams = [
        "recommended_by",
    ];
    const changeParams = [
        ["layout", "profile"],
    ];

    /**
     * Modifies params in the href value for all anchor elements on the page that currently contain the word "discover".
     */
    function replaceLinks() {
        const links = document.querySelectorAll(`a[href*="discover"]`);
        // console.debug(`replacing ${links && links.length} links!`);
        for(let link of links) {
            replaceLink(link);
        }
    }
    
    /**
     * Modifies params in a given anchor's href value.
     * @param {Element} el - any anchor element
     * @returns true if el is valid, false otherwise.
     */
    function replaceLink(el) {
        if (!el || !el.href) return false;
        el.href = cleanUrl(el.href) + "";
        return true;
    }

    /**
     * Removes unwanted parameters from a given url (defined by badParams[]). Also modifies parameters if they exist (defined by changeParams[]).
     * @param {string|URL} urlStr 
     * @returns URL with offending parameters removed. Any error results in it returning back the input.
     */
    function cleanUrl(urlStr) {
        try {
            const url = new URL(urlStr);
            const searchParams = new URLSearchParams(url.search);
            for(let param of badParams) {
                searchParams.delete(param);
            }
            for(let param of changeParams) {
                if(searchParams.has(param[0])){
                    searchParams.set(param[0], param[1]);
                }
            }
            url.search = searchParams;
            return url;
        } catch (error) {
            // fail safe
            console.error(error);
            return urlStr;
        }
    }

    /**
     * 
     * @param {string|URL} urlStr 
     * @returns true if given url contains offending params, false otherwise.
     */
    function isBadUrl(urlStr) {
        const url = new URL(urlStr);
        const searchParams = new URLSearchParams(url.search);
        // check to see if any of the forbidden params exist
        for (let param of badParams) {
            if(searchParams.has(param)){
                return true;
            }
        }
        // check to see if the params that should be set are at the wrong values
        for (let param of changeParams) {
            const val = searchParams.get(param[0]);
            if(val!= null && val != param[1]){
                return true;
            }
        }
        return false;
    }

    /**
     * 
     * @param {string|URL} urlStr 
     * @returns true if given url is the browse/search page, false otherwise.
     */
    function isBrowseUrl(urlStr) {
        const url = new URL(urlStr);
        return url.hostname == "gumroad.com";
    }

    /**
     *  
     * @param {string|URL} urlStr 
     * @returns true if given url is a subdomain that isn't "app.xxx.xxx" 
     */
    function isStorefront(urlStr) {
        const url = new URL(urlStr);
        const subdomainRegex = /^(?!app\.)\w+\.\w+\.\w+/;
        return subdomainRegex.test(url.hostname); 
    }

    const currentUrl = window.location.href;
    // Check if current page has bad params and is a storefront (subdomain), redirect to clean url.
    if(isBadUrl(currentUrl) && isStorefront(currentUrl)) {
        document.location.replace(cleanUrl(currentUrl));

    }else if(isBrowseUrl(currentUrl)) {
        // Otherwise, if we are on the browse page, modify all links.
        // Also set up an observer to re-modify all links every time page elements change.
        const observer = new MutationObserver((mutationList, observer) => replaceLinks());
        observer.observe(document.querySelector("main"), { childList: true, subtree: true, attributes: false });
        replaceLinks();
    }

})();