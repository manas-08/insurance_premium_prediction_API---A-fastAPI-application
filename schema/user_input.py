from pydantic import BaseModel, Field, computed_field, field_validator
from typing import Literal, Annotated
from config.city_tier import tier_1_cities, tier_2_cities


## pydantic model (inheriting from base model)
class UserInput(BaseModel):
    age: Annotated[int, Field(..., gt = 0, lt = 120, description="Age of the user")] 
    height: Annotated[float, Field(..., gt = 0, lt = 2.5, description="Height of the user(in meters)")]
    weight: Annotated[float, Field(..., gt = 0, description= "Weight of the user(in kgs)")]
    income_lpa: Annotated[float, Field(..., gt=0, description="Annual Income of the user in lpa")]
    city: Annotated[str, Field(..., description="The city that the user belongs to")]
    smoker: Annotated[bool, Field(..., description="Is user a smoker?")]
    occupation: Annotated[Literal['retired', 'freelancer', 'student', 'government_job', 'business_owner', 'unemployed', 'private_job'], Field(..., description="Occupation of the User")] # type: ignore

    @computed_field
    @property
    def bmi(self) -> float:
        return self.weight/(self.height**2)
    
    @computed_field
    @property
    def lifestyle_risk(self) -> str:
        if self.smoker == True and self.bmi > 30:
            return 'High'
        elif self.smoker == True or self.bmi > 30:
            return 'Medium'
        else:
            return 'Low'
        
    
    @computed_field
    @property
    def age_group(self) -> str:
        if self.age < 25:
            return 'Young'
        elif self.age < 45:
            return 'Adult'
        elif self.age < 60:
            return 'Middle_aged'
        else:   
            return 'Senior'
        
    
    @computed_field
    @property
    def city_category(self) -> int:
        if self.city in tier_1_cities:
            return 1
        elif self.city in tier_2_cities:
            return 2
        else:
            return 3
        
    @field_validator('city')
    @classmethod
    def normalise_city(cls, value :str) -> str:
        return value.strip().title()
