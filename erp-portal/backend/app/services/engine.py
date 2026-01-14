from typing import List, Dict, Any
from app.models.user import User
from app.models.attendance import Attendance
from app.models.task import Task
from app.models.engine import Rule, RuleLog
from datetime import datetime, timedelta

from app.models.scoring import ScoreConfig

async def calculate_weighted_score(user: User, config_name: str, metrics: Dict[str, float]) -> Dict[str, Any]:
    config = await ScoreConfig.find_one(ScoreConfig.name == config_name)
    if not config:
        # Fallback weights
        weights = {"metric_a": 0.5, "metric_b": 0.5}
    else:
        weights = config.weights
        
    score = sum(metrics.get(k, 0) * weights.get(k, 0) for k in weights)
    score = min(100, max(0, score))
    
    risk_level = "LOW"
    if score > 75: risk_level = "HIGH"
    elif score > 45: risk_level = "MEDIUM"
    
    return {
        "score": round(score, 2),
        "risk_level": risk_level,
        "confidence": 85.0, # Mocked confidence
        "explanation": f"Calculated using {config_name} weighted model with metrics: {metrics}"
    }

async def calculate_burnout_score(user: User) -> Dict[str, Any]:
    # Logic: High overtime in last 30 days + many pending tasks
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    attendance_records = await Attendance.find(
        Attendance.user.id == user.id,
        Attendance.date >= thirty_days_ago
    ).to_list()
    
    overtime_hours = sum(r.overtime for r in attendance_records if hasattr(r, 'overtime'))
    pending_tasks = await Task.find(
        Task.user.id == user.id,
        Task.status == "pending"
    ).count()
    
    metrics = {
        "overtime": float(overtime_hours),
        "pending_tasks": float(pending_tasks)
    }
    
    return await calculate_weighted_score(user, "burnout", metrics)

async def calculate_attrition_risk(user: User) -> Dict[str, Any]:
    # Logic: Salary vs Market (mocked) + Tenure + Performance
    metrics = {
        "salary_gap": 15.0, # % below market
        "tenure_months": 24.0,
        "performance_drop": 0.1 # 10% drop
    }
    return await calculate_weighted_score(user, "attrition", metrics)

async def calculate_project_delay_probability(project_id: str) -> Dict[str, Any]:
    metrics = {
        "overdue_tasks": 5.0,
        "resource_burn_rate": 1.2,
        "dependency_blockers": 2.0
    }
    # Using a dummy user for the generic scorer
    return await calculate_weighted_score(None, "delay", metrics)

async def evaluate_condition(user: User, condition: Dict[str, Any]) -> bool:
    # Pseudo-logic for JSON condition evaluation
    # e.g., {"field": "salary", "operator": ">", "value": 10000}
    return True # Simplified

async def execute_rules():
    rules = await Rule.find(Rule.is_active == True).to_list()
    for rule in rules:
        users = await User.find_all().to_list()
        for user in users:
            if await evaluate_condition(user, rule.condition):
                # Apply logic based on rule_type
                result = {"status": "triggered", "rule_type": rule.rule_type}
                
                log = RuleLog(
                    rule=rule,
                    target_user=user,
                    result=result,
                    action_taken=True
                )
                await log.insert()
