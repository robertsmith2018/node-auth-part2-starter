import fastify from  "fastify";
import fetch from "cross-fetch";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = fastify();

async function startApp(){
    try{
        app.register(fastifyStatic, {
            root: path.join(__dirname, "public"),
        });

        app.get("/verify/:email/:token", {}, async (request, reply) => {
            try {
                const { email, token } = request.params;
                console.log("request", request.params.email, request.params.token)
                reply.code(200).send("All is good!")  
            } catch (e) {
                console.log(e);
            }
        });

        const PORT = 3000;
        await app.listen(PORT);
        console.log(`Server is running on http://localhost:${PORT}`);
    }catch(e){
        console.log(e);
    }
}

startApp();