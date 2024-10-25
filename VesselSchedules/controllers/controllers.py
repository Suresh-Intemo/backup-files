# controllers/schedule_controller.py

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from services.cosco_service import cosco_scraper
from services.hmm_service import hmm_scraper
from services.zim_service import zim_scraper

router = APIRouter()


@router.get("/")
async def root():
    return {"message": "Hello World"}

@router.get("/scrape-schedule/zim")
async def scrape_schedule(port_from: str, port_to: str):
    data = await zim_scraper(port_from, port_to)
    return JSONResponse(content=data)

@router.get("/scrape-schedule/hmm")
async def scrape_schedule(port_from: str, port_to: str):
    data = await hmm_scraper(port_from, port_to)
    return JSONResponse(content=data)

@router.get("/scrape-schedule/cosco")
async def scrape_schedule(port_from: str, port_to: str):
    data = await cosco_scraper(port_from, port_to)
    return JSONResponse(content=data)