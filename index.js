const Router = require('./router')

/**
 * Example of how router can be used in an application
 *  */
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

const linkArr = [
    { name: "Cloudflare Worker Blog", url: "https://blog.cloudflare.com/asynchronous-htmlrewriter-for-cloudflare-workers/" },
    { name: "GitHub", url: "https://github.com/jonlee96" },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/jonathan-lee-b6099a116/" } 
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
                .on("div#profile", new AttributeRemover('style'))
                .on("div#social", new AttributeRemover('style'))
                .on("body", new AttributeRemover('class'))
                .on("body", new AttributeAdder('class', 'bg-red-900'))
                .on("div#social", new ElementAdder('div', 'id', 'links'))
                .on("img#avatar", new AttributeAdder('src', 'https://avatars0.githubusercontent.com/u/48492574?s=460&u=f96be9951fb82082ea4546f308254554d30a742e&v=4'))
                .on("h1#name", new TextAdder('Jonathan Lee'))
                .on("title", new TextReplacer("Hi Cloudflare!"))
                .transform(res);
        })
    )
    const resp = await r.route(request)

    return resp
}

// Probably not the best implementation, but it works for the given time
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

class AttributeRemover {
    constructor(attributeName) {
        this.attributeName = attributeName;
    }
    async element(element) {
        const attribute = element.getAttribute(this.attributeName);
        if(attribute) {
            element.removeAttribute(this.attributeName);
        }
    }
}

class AttributeAdder {
    constructor(attributeName, attributeValue) {
        this.attributeName = attributeName;
        this.attributeValue = attributeValue;
    }
    async element(element) {
        element.setAttribute(
            this.attributeName,
            this.attributeValue
        )
    }
}

class TextAdder {
    constructor(textContent) {
        this.textContent = textContent;
    }

    async element(element) {
        element.prepend(this.textContent);
    }
}

class ElementAdder {
    constructor(elementTag, attributeName, attributeValue) {
        this.elementTag = elementTag;
        this.attributeName = attributeName;
        this.attributeValue = attributeValue;
    }

    async element(element) {
        if(this.attributeName) {
            element.prepend(`<${this.elementTag} ${this.attributeName}="${this.attributeValue}"></${this.elementTag}>`, { html: true })
        } else {
            element.prepend(`<${this.elementTag}></${this.elementTag}>`, { html: true })
        }
    }
}

class TextReplacer {
    constructor(textContent) {
        this.textContent = textContent;
    }

    async element(element) {
        element.setInnerContent(this.textContent);
    }
}