from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
import logging
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

from services.analytics_service import AnalyticsService
from services.database_service import DatabaseService
from services.ml_service import MLService

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="TREND Analytics Service",
    description="Analytics and ML microservice for trend analysis",
    version="1.0.0"
)

# Initialize services
db_service = DatabaseService()
analytics_service = AnalyticsService(db_service)
ml_service = MLService()

# Pydantic models
class TrendAnalysisRequest(BaseModel):
    trend_id: str
    analysis_type: str = "performance"  # performance, sentiment, risk
    time_window_days: int = 7

class CoinAnalysisRequest(BaseModel):
    coin_ids: List[str]
    analysis_type: str = "correlation"  # correlation, volatility, momentum

class PerformanceMetrics(BaseModel):
    trend_id: str
    total_return: float
    volatility: float
    sharpe_ratio: float
    max_drawdown: float
    win_rate: float
    avg_holding_period: float
    calculated_at: datetime

class CorrelationMatrix(BaseModel):
    coin_ids: List[str]
    correlation_matrix: List[List[float]]
    calculated_at: datetime

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "analytics"
    }

# Trend performance analysis
@app.post("/api/analytics/trend-performance")
async def analyze_trend_performance(request: TrendAnalysisRequest):
    try:
        result = await analytics_service.analyze_trend_performance(
            trend_id=request.trend_id,
            time_window_days=request.time_window_days
        )
        return result
    except Exception as e:
        logger.error(f"Error analyzing trend performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Coin correlation analysis
@app.post("/api/analytics/coin-correlation")
async def analyze_coin_correlation(request: CoinAnalysisRequest):
    try:
        result = await analytics_service.analyze_coin_correlation(
            coin_ids=request.coin_ids
        )
        return result
    except Exception as e:
        logger.error(f"Error analyzing coin correlation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Risk assessment
@app.post("/api/analytics/risk-assessment")
async def assess_risk(request: TrendAnalysisRequest):
    try:
        result = await analytics_service.assess_trend_risk(
            trend_id=request.trend_id,
            time_window_days=request.time_window_days
        )
        return result
    except Exception as e:
        logger.error(f"Error assessing risk: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Market sentiment analysis
@app.post("/api/analytics/sentiment")
async def analyze_sentiment(request: TrendAnalysisRequest):
    try:
        result = await analytics_service.analyze_market_sentiment(
            trend_id=request.trend_id,
            time_window_days=request.time_window_days
        )
        return result
    except Exception as e:
        logger.error(f"Error analyzing sentiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ML-based trend prediction
@app.post("/api/ml/predict-trend")
async def predict_trend_performance(request: TrendAnalysisRequest):
    try:
        result = await ml_service.predict_trend_performance(
            trend_id=request.trend_id,
            time_window_days=request.time_window_days
        )
        return result
    except Exception as e:
        logger.error(f"Error predicting trend: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Batch analysis for multiple trends
@app.post("/api/analytics/batch-analysis")
async def batch_analysis(background_tasks: BackgroundTasks, trend_ids: List[str]):
    try:
        # Start background task for batch processing
        background_tasks.add_task(
            analytics_service.batch_analyze_trends,
            trend_ids
        )
        return {"message": "Batch analysis started", "trend_count": len(trend_ids)}
    except Exception as e:
        logger.error(f"Error starting batch analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get analytics dashboard data
@app.get("/api/analytics/dashboard")
async def get_dashboard_data():
    try:
        result = await analytics_service.get_dashboard_metrics()
        return result
    except Exception as e:
        logger.error(f"Error getting dashboard data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get top performing trends
@app.get("/api/analytics/top-trends")
async def get_top_trends(limit: int = 10, time_window_days: int = 30):
    try:
        result = await analytics_service.get_top_performing_trends(
            limit=limit,
            time_window_days=time_window_days
        )
        return result
    except Exception as e:
        logger.error(f"Error getting top trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get market insights
@app.get("/api/analytics/market-insights")
async def get_market_insights():
    try:
        result = await analytics_service.get_market_insights()
        return result
    except Exception as e:
        logger.error(f"Error getting market insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
