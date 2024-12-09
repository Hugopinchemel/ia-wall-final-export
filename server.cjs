const fs = require("fs");
const http = require("http");
const host = "localhost";
const port = 8080;
const OpenAI = require("openai");
const openai = new OpenAI();
const server = http.createServer();

server.on("request", (req, res) => {
    console.log(`Request URL: ${req.url}`);
    if (req.url === "/stylesheet") {
        const stylesheet = fs.readFileSync("./style.css");
        res.end(stylesheet);
    } else if (req.url === "/script") {
        const script = fs.readFileSync("./index.js");
        res.end(script);
    } else if (req.url === "/") {
        const index = fs.readFileSync("./index.html");
        res.end(index);
    } else if (req.url === "/generate" && req.method === "POST") {
        let data = "";
        req.on("data", chunk => {
            data += chunk;
        });
        req.on("end", async () => {
            try {
                const {sentence} = JSON.parse(data);
                console.log(`Received sentence: ${sentence}`);

                // Call OpenAI API with the received sentence
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        {role: "system", content: "You are a helpful assistant."},
                        {
                            role: "user",
                            content: `Provide three real-life examples using the following sentence: "${sentence}". For each example, include the title, a detailed explanation, and format it using HTML with the class "chat" by creating an unordered list <ul class="chat">, where each list item <li> contains a title and a detailed explanation, using <strong></strong> tags to bold key terms or concepts. don't include any commentary, jsut put title and exemples`
                        },
                    ],
                    temperature: 1,
                    max_tokens: 2048,
                    top_p: 0.5,
                    frequency_penalty: 1,
                    presence_penalty: 1
                });

                const responseMessage = completion.choices[0].message.content;

                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify({status: "success", response: responseMessage}));
            } catch (error) {
                console.error(error);
                res.writeHead(400, {"Content-Type": "application/json"});
                res.end(JSON.stringify({status: "error", message: "Invalid JSON or OpenAI API error"}));
            }
        });
    } else {
        res.statusCode = 404;
        res.end("404 Not Found");
    }
});

server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});