require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testLLM() {

    try {

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        const result = await model.generateContent(
            "Say Hello from Gemini AI"
        );

        const response = await result.response.text();

        console.log("\n===============================");
        console.log("Gemini Response:");
        console.log("===============================");
        console.log(response);

    } catch (error) {

        console.log("Gemini Connection Failed");
        console.error(error.message);

    }

}

testLLM();