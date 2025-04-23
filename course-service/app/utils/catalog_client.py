import os
import httpx

CATALOG_SERVICE_URL = os.getenv("CATALOG_SERVICE_URL", "http://course-api:8000")

class CatalogClient:
    def __init__(self, base_url: str = None):
        self.base_url = base_url or CATALOG_SERVICE_URL
        self.client = httpx.AsyncClient(base_url=self.base_url)

    async def get_course(self, course_id: str):
        response = await self.client.get(f"/courses/{course_id}")
        response.raise_for_status()
        return response.json()

    async def get_all_courses(self):
        response = await self.client.get("/courses/")
        response.raise_for_status()
        return response.json()

    async def close(self):
        await self.client.aclose()