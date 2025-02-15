import express from "express";
import request from "request";
import cors from "cors";
import { URL } from "url";

const app = express();
app.use(cors());

// Function to forward requests while preserving content type
const proxyRequest = (targetUrl, res) => {
    request(
        {
            url: targetUrl,
            headers: { "User-Agent": "Mozilla/5.0" }, // Avoid bot blocking
            encoding: null, // Preserve binary encoding for images, CSS, JS
        },
        (error, response, body) => {
            if (error) {
                return res.status(500).send("Error fetching the URL.");
            }
            const contentType = response.headers["content-type"];
            res.set("Content-Type", contentType);
            res.send(body);
        }
    );
};

// Main proxy route
app.get("/proxy", (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        console.error("Missing URL parameter.");
        return res.status(400).send("Missing URL parameter.");
    }

    const parsedUrl = new URL(targetUrl);

    // Check if the request is for CSS, JS, images, or HTML; proxy them directly if so.
    if (parsedUrl.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|otf)$/)) {
        console.log(`Direct proxying for asset: ${targetUrl}`);
        return proxyRequest(targetUrl, res);
    }

    // Fetch and modify HTML pages only
    request(
        {
            url: targetUrl,
            headers: { "User-Agent": "Mozilla/5.0" },
            encoding: null,
        },
        (error, response, body) => {
            if (error) {
                console.error("Error fetching URL:", targetUrl, error);
                return res.status(500).send("Error fetching the URL.");
            }

            let modifiedBody = body.toString();
            const contentType = response.headers["content-type"];
            res.set("Content-Type", contentType);
            // console.log(`Fetched URL: ${targetUrl} with contentType: ${contentType}`);

            if (contentType.includes("text/html")) {
                // Get the origin from the target URL
                const baseUrl = new URL(targetUrl).origin;
                console.log("Base URL:", baseUrl);

                // Inject a base tag so relative URLs resolve properly
                // const baseTag = `<base href="${baseUrl}/">`;
                // modifiedBody = modifiedBody.replace("<head>", `<head>${baseTag}`);
                // console.log("Injected base tag:", baseTag);

                // Use a regex that matches both relative ("/foo") and protocol-relative ("//foo") URLs.
                modifiedBody = modifiedBody.replace(
                    /(href|src)="((?:\/{1,2})[^"]*)"/g,
                    (match, attr, urlPath) => {
                        // If this is a src attribute, skip rewriting.
                        if (attr === "src") {
                            return match;
                        }
                        
                        // Skip if already proxied or needs to be left intact.
                        if (
                            urlPath.startsWith("/proxy") ||
                            urlPath.startsWith("/scripts/") ||
                            urlPath.includes("/proxy?url=") ||
                            urlPath.startsWith("//images.squarespace-cdn.com")
                        ) {
                            return `${attr}="${urlPath}"`;
                        }
                        
                        // Determine fullUrl based on whether the urlPath is protocol-relative or relative.
                        let fullUrl;
                        if (urlPath.startsWith("//")) {
                            fullUrl = "https:" + urlPath;
                        } else {
                            fullUrl = baseUrl + urlPath;
                        }
                        
                        const rewritten = `${attr}="/proxy?url=${encodeURIComponent(fullUrl)}"`;
                        return rewritten;
                    }
                );

                // Inject a script to track link clicks (if needed)
                const trackingScript = `
                  <script>
                    document.addEventListener("click", function(event) {
                      let target = event.target;
                      while (target && target.tagName !== "A") {
                        target = target.parentElement;
                      }
                      if (target && target.tagName === "A") {
                        console.log("Link clicked:", target.href);
                        event.preventDefault();
                        window.parent.postMessage({ clickedLink: target.href }, "*");
                      }
                    });
                  </script>
                `;
                modifiedBody = modifiedBody.replace("</body>", trackingScript + "</body>");
                // console.log("Injected tracking script.");
            }

            // console.log("Sending modified response for URL:", targetUrl);
            res.send(modifiedBody);
        }
    );
});

// Start server
app.listen(8000, () => {
    console.log("Proxy server running on http://localhost:8000");
});