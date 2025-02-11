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
        return res.status(400).send("Missing URL parameter.");
    }

    const parsedUrl = new URL(targetUrl);

    // Check if the request is for CSS, JS, images, or HTML
    if (parsedUrl.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|otf)$/)) {
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
                return res.status(500).send("Error fetching the URL.");
            }

            let modifiedBody = body.toString();
            const contentType = response.headers["content-type"];
            res.set("Content-Type", contentType);

            if (contentType.includes("text/html")) {
                // Convert relative URLs to absolute Wikipedia URLs
                modifiedBody = modifiedBody.replace(
                    /href="(\/[^"]+)"/g,
                    `href="https://https://$1"`
                );
                modifiedBody = modifiedBody.replace(
                    /src="(\/[^"]+)"/g,
                    `src="https://https://$1"`
                );

                // Inject a script to track link clicks
                const trackingScript = `
                  <script>
                    document.addEventListener("click", function(event) {
                      let target = event.target;
                      while (target && target.tagName !== "A") {
                        target = target.parentElement;
                      }
                      if (target && target.tagName === "A") {
                        event.preventDefault();
                        window.parent.postMessage({ clickedLink: target.href }, "*");
                      }
                    });
                  </script>
                `;

                modifiedBody = modifiedBody.replace("</body>", trackingScript + "</body>");
            }

            res.send(modifiedBody);
        }
    );
});

// Start server
app.listen(8000, () => {
    console.log("Proxy server running on http://localhost:8000");
});
