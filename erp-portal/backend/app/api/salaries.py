from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user, check_role
from app.models.user import User
from app.models.rbac import Role, Department, RoleEnum
from app.models.salary import Salary
from beanie.operators import In

router = APIRouter()

@router.post("/")
async def create_salary_record(
    user_id: str,
    amount: float,
    month: int,
    year: int,
    bonus: float = 0.0,
    deductions: float = 0.0,
    current_user: User = Depends(check_role([RoleEnum.SUPER_ADMIN, RoleEnum.DEPARTMENT_HEAD]))
):
    # Check if user is in Finance dept or Super Admin
    # For now, we'll fetch the linked department if it's a Link
    dept = await current_user.department.fetch() if current_user.department else None
    if current_user.role == RoleEnum.DEPARTMENT_HEAD and (not dept or dept.code != "FINANCE"):
        raise HTTPException(status_code=403, detail="Only Finance dept head can create salary records")

    target_user = await User.get(user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    salary = Salary(
        user=target_user,
        amount=amount,
        month=month,
        year=year,
        bonus=bonus,
        deductions=deductions
    )
    await salary.insert()
    return salary

@router.get("/my-salary")
async def get_my_salary(current_user: User = Depends(get_current_user)):
    return await Salary.find(Salary.user.id == current_user.id).to_list()

@router.get("/all")
async def get_all_salaries(current_user: User = Depends(check_role([RoleEnum.SUPER_ADMIN, RoleEnum.DEPARTMENT_HEAD]))):
    if current_user.role == RoleEnum.SUPER_ADMIN:
        return await Salary.find_all(fetch_links=True).to_list()
    
    dept = await current_user.department.fetch() if current_user.department else None
    if not dept or dept.code != "FINANCE":
         raise HTTPException(status_code=403, detail="Only Finance dept head can view all salaries")

    return await Salary.find_all(fetch_links=True).to_list()
