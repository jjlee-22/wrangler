const Router = require('./router')

/**
 * Example of how router can be used in an application
 *  */
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

const linkArr = [
    { name: "Cloudflare", url: "https://cloudflare.com" },
    { name: "Google", url: "https://google.com" },
    { name: "Example Page", url: "http://example.com" } 
]

const handler = (request) => {
    const init = {
        headers: { 'content-type': 'application/json' },
    }
    const body = JSON.stringify( linkArr )
    return new Response(body, init)
}

const handleRequest = async (request) => {
    const r = new Router()
    // Replace with the appropriate paths and handlers
    r.get('.*/links', request => handler(request))
    r.get('.*/.*', request => fetch('https://static-links-page.signalnerve.workers.dev')
        .then((res) => {
            return new HTMLRewriter()
                .on("div#links", new LinksTransformer())
                .on("div#profile", new ElementHandler())
                .transform(res);
        })
    )
    const resp = await r.route(request)

    return resp
}

class LinksTransformer {
    constructor(links) {
        this.links = links;
    }

    async element(element) {
        for (let i = 0; i < linkArr.length; i++) {
            element.prepend(`<a href=${linkArr[i].url}>${linkArr[i].name}</a>`, { html: true })
        }
    }
}