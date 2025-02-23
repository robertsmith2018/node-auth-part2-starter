import fastify from  "fastify";
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
        const PORT = 3000; // Changed port number to avoid conflict
        await app.listen(PORT);
        console.log(`Server is running on http://localhost:${PORT}`);
    }catch(e){
        console.log(e);
    }
}

startApp();