import uvicorn
import asyncio
from scripts.utils import prisma
from fastapi import FastAPI
from lib.users import userRoute
from lib.todos import todosRoute
from lib.comments import comentRoutes
from scalar_fastapi import get_scalar_api_reference
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

route = [userRoute,todosRoute,comentRoutes]

for routes in route:
    app.include_router(router=routes, prefix="/api/v1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"hello": "world"}

@app.get("/scalar", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title=app.title,
    )


async def main():
    await prisma.connect()
    config = uvicorn.Config("main:app", port=4000, log_level="info",reload=True, reload_delay=100)
    server = uvicorn.Server(config)
    await server.serve()


if __name__ == "__main__":
    asyncio.run(main())