import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DecisionForm.css';

const DecisionForm =  ({ token }) => {
  const { domainId } = useParams();
  const navigate = useNavigate();
  const [domain, setDomain] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  

  // Domain data with required inputs
  const domainsData = {
    'family-budget': {
      name: 'Monthly Family Budget',
      inputs: [
        { id: 'monthlyIncome', label: 'Total Monthly Income', type: 'number', required: true },
        { id: 'fixedExpenses', label: 'Fixed Expenses (rent, bills)', type: 'number', required: true },
        { id: 'variableExpenses', label: 'Variable Expenses', type: 'number', required: true },
        { id: 'savingsGoal', label: 'Monthly Savings Goal', type: 'number', required: true },
        { id: 'emergencyFund', label: 'Emergency Fund', type: 'number', required: true }
      ],
      decisionType: 'Expense distribution, spending priorities, savings plan'
    },
    'family-food': {
      name: 'Weekly Family Meals',
      inputs: [
        { id: 'familySize', label: 'Number of Family Members', type: 'number', required: true },
        { id: 'dietaryPreferences', label: 'Dietary Preferences', type: 'text', required: true },
        { id: 'foodBudget', label: 'Weekly Food Budget', type: 'number', required: true },
        { id: 'cookingTime', label: 'Daily Cooking Time Available', type: 'number', required: true },
        { id: 'specialDiets', label: 'Special Diets', type: 'text', required: false }
      ],
      decisionType: 'Weekly meal plan, shopping schedule, task distribution'
    },
    'home-organization': {
      name: 'Home Organization and Task Distribution',
      inputs: [
        { id: 'houseSize', label: 'House Size', type: 'select', options: ['Small', 'Medium', 'Large'], required: true },
        { id: 'familyMembers', label: 'Number of Family Members', type: 'number', required: true },
        { id: 'availableTime', label: 'Weekly Available Time', type: 'number', required: true },
        { id: 'priorityAreas', label: 'Areas Needing Organization', type: 'text', required: true },
        { id: 'storageNeeds', label: 'Storage Needs', type: 'text', required: true }
      ],
      decisionType: 'Cleaning schedule, task distribution, storage solutions'
    },
    'education-planning': {
      name: 'Education Planning and Lessons',
      inputs: [
        { id: 'childrenAges', label: 'Children Ages', type: 'text', required: true },
        { id: 'academicLevels', label: 'Academic Levels', type: 'text', required: true },
        { id: 'learningGoals', label: 'Learning Goals', type: 'text', required: true },
        { id: 'studyTime', label: 'Available Study Time', type: 'number', required: true },
        { id: 'extracurricular', label: 'Extracurricular Activities', type: 'text', required: false }
      ],
      decisionType: 'Study schedule, educational activities, progress tracking'
    },
    'family-health': {
      name: 'General Health and Checkup Monitoring',
      inputs: [
        { id: 'familyMembers', label: 'Number of Family Members', type: 'number', required: true },
        { id: 'chronicConditions', label: 'Chronic Health Conditions', type: 'text', required: false },
        { id: 'medicationNeeds', label: 'Medication Needs', type: 'text', required: false },
        { id: 'checkupSchedule', label: 'Checkup Schedule', type: 'text', required: true },
        { id: 'healthGoals', label: 'Health Goals', type: 'text', required: true }
      ],
      decisionType: 'Checkup schedule, health plan, medication tracking'
    },
    'leisure-activities': {
      name: 'Leisure Activities and Trips',
      inputs: [
        { id: 'familySize', label: 'Number of Participants', type: 'number', required: true },
        { id: 'interests', label: 'Family Interests', type: 'text', required: true },
        { id: 'budget', label: 'Budget', type: 'number', required: true },
        { id: 'availableTime', label: 'Available Time', type: 'text', required: true },
        { id: 'preferences', label: 'Preferences', type: 'text', required: true }
      ],
      decisionType: 'Suitable activities, trip planning, budget distribution'
    },
    'community-engagement': {
      name: 'Communication and Neighborhood Engagement',
      inputs: [
        { id: 'communitySize', label: 'Community Size', type: 'select', options: ['Small', 'Medium', 'Large'], required: true },
        { id: 'interactionFrequency', label: 'Desired Interaction Frequency', type: 'select', options: ['Low', 'Medium', 'High'], required: true },
        { id: 'sharedInterests', label: 'Shared Interests', type: 'text', required: true },
        { id: 'availableTime', label: 'Available Time', type: 'number', required: true },
        { id: 'communicationPreferences', label: 'Communication Preferences', type: 'text', required: true }
      ],
      decisionType: 'Community activities, communication schedule, joint initiatives'
    },
    'work-family-balance': {
      name: 'Work-Family Time Balance',
      inputs: [
        { id: 'workHours', label: 'Weekly Work Hours', type: 'number', required: true },
        { id: 'familyTime', label: 'Required Family Time', type: 'number', required: true },
        { id: 'personalTime', label: 'Personal Time', type: 'number', required: true },
        { id: 'priorityTasks', label: 'Priority Tasks', type: 'text', required: true },
        { id: 'flexibility', label: 'Schedule Flexibility', type: 'select', options: ['Low', 'Medium', 'High'], required: true }
      ],
      decisionType: 'Balanced schedule, priorities, time planning'
    },
    'volunteering': {
      name: 'Small Volunteering Participation',
      inputs: [
        { id: 'causeInterest', label: 'Preferred Causes', type: 'text', required: true },
        { id: 'timeCommitment', label: 'Weekly Available Time', type: 'number', required: true },
        { id: 'skills', label: 'Available Skills', type: 'text', required: true },
        { id: 'locationPreference', label: 'Location Preferences', type: 'text', required: true },
        { id: 'impactGoal', label: 'Impact Goal', type: 'text', required: true }
      ],
      decisionType: 'Suitable volunteering opportunities, participation schedule, skill utilization'
    },
    'celebrations': {
      name: 'Celebrations and Events Management',
      inputs: [
        { id: 'eventType', label: 'Event Type', type: 'text', required: true },
        { id: 'guestCount', label: 'Number of Guests', type: 'number', required: true },
        { id: 'budget', label: 'Budget', type: 'number', required: true },
        { id: 'preparationTime', label: 'Preparation Time', type: 'number', required: true },
        { id: 'preferences', label: 'Celebration Preferences', type: 'text', required: true }
      ],
      decisionType: 'Preparation plan, task distribution, cost management'
    },
    'transportation': {
      name: 'Family Transportation and Commuting',
      inputs: [
        { id: 'dailyTrips', label: 'Number of Daily Trips', type: 'number', required: true },
        { id: 'distance', label: 'Total Distances', type: 'number', required: true },
        { id: 'transportOptions', label: 'Available Transport Options', type: 'text', required: true },
        { id: 'timeConstraints', label: 'Time Constraints', type: 'text', required: true },
        { id: 'costLimit', label: 'Cost Limit', type: 'number', required: true }
      ],
      decisionType: 'Commuting schedule, transportation options, cost savings'
    },
    'shopping': {
      name: 'Weekly Household Shopping',
      inputs: [
        { id: 'shoppingList', label: 'Shopping List', type: 'textarea', required: true },
        { id: 'budget', label: 'Budget', type: 'number', required: true },
        { id: 'shoppingFrequency', label: 'Shopping Frequency', type: 'select', options: ['Daily', 'Weekly', 'Monthly'], required: true },
        { id: 'storePreferences', label: 'Preferred Stores', type: 'text', required: true },
        { id: 'priorityItems', label: 'Priority Items', type: 'text', required: true }
      ],
      decisionType: 'Optimal shopping list, budget distribution, purchase timing'
    },
    'digital-entertainment': {
      name: 'Digital Entertainment Management',
      inputs: [
        { id: 'screenTime', label: 'Current Screen Time', type: 'number', required: true },
        { id: 'contentTypes', label: 'Content Types', type: 'text', required: true },
        { id: 'familyPreferences', label: 'Family Preferences', type: 'text', required: true },
        { id: 'timeLimits', label: 'Required Time Limits', type: 'number', required: true },
        { id: 'educationalContent', label: 'Educational Content', type: 'text', required: false }
      ],
      decisionType: 'Viewing schedule, appropriate content, screen time management'
    },
    'children-projects': {
      name: 'Children Projects and Hobbies',
      inputs: [
        { id: 'childrenAges', label: 'Children Ages', type: 'text', required: true },
        { id: 'interests', label: 'Children Interests', type: 'text', required: true },
        { id: 'availableTime', label: 'Available Time', type: 'number', required: true },
        { id: 'budget', label: 'Budget', type: 'number', required: true },
        { id: 'learningGoals', label: 'Learning Goals', type: 'text', required: true }
      ],
      decisionType: 'Suitable projects, educational activities, skill development'
    },
    'family-relationships': {
      name: 'Family Relationships Management',
      inputs: [
        { id: 'familySize', label: 'Family Size', type: 'number', required: true },
        { id: 'communicationFrequency', label: 'Communication Frequency', type: 'select', options: ['Low', 'Medium', 'High'], required: true },
        { id: 'relationshipGoals', label: 'Relationship Goals', type: 'text', required: true },
        { id: 'challenges', label: 'Current Challenges', type: 'text', required: false },
        { id: 'preferredActivities', label: 'Preferred Activities', type: 'text', required: true }
      ],
      decisionType: 'Communication schedule, family activities, relationship improvement'
    },
    'long-term-finance': {
      name: 'Long-Term Financial Planning',
      inputs: [
        { id: 'financialGoals', label: 'Financial Goals', type: 'text', required: true },
        { id: 'timeframe', label: 'Timeframe (years)', type: 'number', required: true },
        { id: 'currentSavings', label: 'Current Savings', type: 'number', required: true },
        { id: 'monthlyContribution', label: 'Monthly Contribution', type: 'number', required: true },
        { id: 'riskTolerance', label: 'Risk Tolerance', type: 'select', options: ['Low', 'Medium', 'High'], required: true }
      ],
      decisionType: 'Savings plan, investments, financial goals achievement'
    },
    'family-travel': {
      name: 'Family Travel Decisions',
      inputs: [
        { id: 'destinationPreferences', label: 'Destination Preferences', type: 'text', required: true },
        { id: 'travelDuration', label: 'Travel Duration', type: 'number', required: true },
        { id: 'budget', label: 'Budget', type: 'number', required: true },
        { id: 'familySize', label: 'Number of Travelers', type: 'number', required: true },
        { id: 'travelDates', label: 'Travel Dates', type: 'text', required: true }
      ],
      decisionType: 'Suitable destination, trip planning, cost management'
    },
    'elderly-care': {
      name: 'Elderly Care in Family',
      inputs: [
        { id: 'careNeeds', label: 'Care Needs', type: 'text', required: true },
        { id: 'availableCaregivers', label: 'Number of Caregivers', type: 'number', required: true },
        { id: 'medicalRequirements', label: 'Medical Requirements', type: 'text', required: true },
        { id: 'timeCommitment', label: 'Required Time', type: 'number', required: true },
        { id: 'supportNeeds', label: 'Support Needs', type: 'text', required: true }
      ],
      decisionType: 'Care schedule, task distribution, support provision'
    },
    'energy-management': {
      name: 'Energy and Home Utilities Management',
      inputs: [
        { id: 'currentConsumption', label: 'Current Energy Consumption', type: 'number', required: true },
        { id: 'energyGoals', label: 'Saving Goals', type: 'text', required: true },
        { id: 'applianceUsage', label: 'Appliance Usage', type: 'text', required: true },
        { id: 'budget', label: 'Budget for Improvements', type: 'number', required: true },
        { id: 'familyHabits', label: 'Family Habits', type: 'text', required: true }
      ],
      decisionType: 'Saving plans, efficiency improvements, consumption management'
    },
    'emergency-preparedness': {
      name: 'Emergency Preparedness and Safety Plans',
      inputs: [
        { id: 'riskAssessment', label: 'Risk Assessment', type: 'text', required: true },
        { id: 'familySize', label: 'Number of Family Members', type: 'number', required: true },
        { id: 'specialNeeds', label: 'Special Needs', type: 'text', required: false },
        { id: 'resources', label: 'Available Resources', type: 'text', required: true },
        { id: 'evacuationPlan', label: 'Evacuation Plan', type: 'text', required: true }
      ],
      decisionType: 'Emergency plans, preparations, safety procedures'
    },
    'health-nutrition': {
      name: 'Family Health Nutrition',
      inputs: [
        { id: 'dietaryGoals', label: 'Dietary Goals', type: 'text', required: true },
        { id: 'foodPreferences', label: 'Food Preferences', type: 'text', required: true },
        { id: 'cookingSkills', label: 'Cooking Skills', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'], required: true },
        { id: 'timeConstraints', label: 'Time Constraints', type: 'text', required: true },
        { id: 'budget', label: 'Food Budget', type: 'number', required: true }
      ],
      decisionType: 'Meal plans, healthy recipes, habit improvement'
    },
    'home-cleaning': {
      name: 'Home Cleaning Scheduling and Organization',
      inputs: [
        { id: 'homeSize', label: 'Home Size', type: 'select', options: ['Small', 'Medium', 'Large'], required: true },
        { id: 'cleaningFrequency', label: 'Required Cleaning Frequency', type: 'select', options: ['Daily', 'Weekly', 'Monthly'], required: true },
        { id: 'availableTime', label: 'Available Time', type: 'number', required: true },
        { id: 'cleaningStandards', label: 'Cleaning Standards', type: 'select', options: ['Basic', 'Medium', 'High'], required: true },
        { id: 'familyParticipation', label: 'Family Participation', type: 'select', options: ['Low', 'Medium', 'High'], required: true }
      ],
      decisionType: 'Cleaning schedule, task distribution, suitable products'
    },
    'weekly-schedule': {
      name: 'Family Weekly Schedule Coordination',
      inputs: [
        { id: 'familyActivities', label: 'Family Activities', type: 'textarea', required: true },
        { id: 'timeSlots', label: 'Available Time Slots', type: 'text', required: true },
        { id: 'priorities', label: 'Priorities', type: 'text', required: true },
        { id: 'flexibility', label: 'Required Flexibility', type: 'select', options: ['Low', 'Medium', 'High'], required: true },
        { id: 'coordinationNeeds', label: 'Coordination Needs', type: 'text', required: true }
      ],
      decisionType: 'Weekly schedule, appointment coordination, activity management'
    },
    'conflict-resolution': {
      name: 'Family Conflict Resolution',
      inputs: [
        { id: 'conflictType', label: 'Conflict Type', type: 'text', required: true },
        { id: 'partiesInvolved', label: 'Parties Involved', type: 'text', required: true },
        { id: 'underlyingIssues', label: 'Underlying Issues', type: 'text', required: true },
        { id: 'communicationStyle', label: 'Communication Style', type: 'text', required: true },
        { id: 'desiredOutcome', label: 'Desired Outcome', type: 'text', required: true }
      ],
      decisionType: 'Conflict resolution strategies, communication improvement, agreement building'
    },
    'special-occasions': {
      name: 'Special Occasions Preparation',
      inputs: [
        { id: 'occasionType', label: 'Occasion Type', type: 'text', required: true },
        { id: 'preparationTime', label: 'Preparation Time', type: 'number', required: true },
        { id: 'budget', label: 'Budget', type: 'number', required: true },
        { id: 'guestList', label: 'Guest List', type: 'text', required: true },
        { id: 'familyTraditions', label: 'Family Traditions', type: 'text', required: true }
      ],
      decisionType: 'Preparation plans, task distribution, event management'
    }
  };

  useEffect(() => {
    // Load the selected domain data
    if (domainsData[domainId]) {
      setDomain(domainsData[domainId]);
      // Initialize form data
      const initialData = {};
      domainsData[domainId].inputs.forEach(input => {
        initialData[input.id] = '';
      });
      setFormData(initialData);
    } else {
      // If domain not found, redirect to home page
      navigate('/');
    }
  }, [domainId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNextStep = () => {
    if (currentStep < domain.inputs.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // تحويل البيانات إلى نص واضح
      const userInput = Object.entries(formData)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');

const response = await fetch("http://localhost:5001/api/decision", {
  method: "POST",
  headers: { 
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`   // ← هذا جديد
  },
  body: JSON.stringify({ input: userInput })
});   

      const data = await response.json();

if (data.error) {
  alert("Error from server: " + data.error);
  setIsLoading(false);
  return;
}

// تمرير blockchainId أيضاً للعرض في صفحة النتائج
navigate(`/result/${domainId}`, {
  state: {
    formData,
    domainName: domain.name,
    aiResult: data.result,
    blockchainId: data.blockchainId
  }
});

    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form: " + error.message);
      setIsLoading(false);
    }
  };

  if (!domain) {
    return <div className="loading">Loading data...</div>;
  }

  return (
    <div className="decision-form-container">
      <div className="form-header">
        <h1>{domain.name}</h1>
        <p className="decision-type">Decision Type: {domain.decisionType}</p>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${((currentStep + 1) / domain.inputs.length) * 100}% `}}
        ></div>
      </div>

      <form onSubmit={handleSubmit} className="decision-form">
        <div className="form-step">
          <h3>{domain.inputs[currentStep].label}</h3>
          
          {domain.inputs[currentStep].type === 'text' && (
            <input
              type="text"
              name={domain.inputs[currentStep].id}
              value={formData[domain.inputs[currentStep].id] || ''}
              onChange={handleInputChange}
              required={domain.inputs[currentStep].required}
              placeholder={`Enter ${domain.inputs[currentStep].label}`}
            />
          )}
          
          {domain.inputs[currentStep].type === 'number' && (
            <input
              type="number"
              name={domain.inputs[currentStep].id}
              value={formData[domain.inputs[currentStep].id] || ''}
              onChange={handleInputChange}
              required={domain.inputs[currentStep].required}
              placeholder={`Enter ${domain.inputs[currentStep].label}`}
            />
          )}
          
          {domain.inputs[currentStep].type === 'select' && (
            <select
              name={domain.inputs[currentStep].id}
              value={formData[domain.inputs[currentStep].id] || ''}
              onChange={handleInputChange}
              required={domain.inputs[currentStep].required}
            >
              <option value="">Select {domain.inputs[currentStep].label}</option>
              {domain.inputs[currentStep].options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          )}
          
          {domain.inputs[currentStep].type === 'textarea' && (
            <textarea
              name={domain.inputs[currentStep].id}
              value={formData[domain.inputs[currentStep].id] || ''}
              onChange={handleInputChange}
              required={domain.inputs[currentStep].required}
              placeholder={`Enter ${domain.inputs[currentStep].label}`}
              rows="4"
            />
          )}
        </div>

        <div className="form-navigation">
          {currentStep > 0 && (
            <button type="button" onClick={handlePrevStep} className="nav-button prev">
              Previous
            </button>
          )}
          
          {currentStep < domain.inputs.length - 1 ? (
            <button type="button" onClick={handleNextStep} className="nav-button next">
              Next
            </button>
          ) : (
            <button type="submit" disabled={isLoading} className="submit-button">
              {isLoading ? 'Processing data...' : 'Make Decision'}
            </button>
          )}
        </div>
      </form>

      <div className="form-info">
        <h3>Additional Information:</h3>
        <p>The data you enter will be analyzed using artificial intelligence to provide the best possible decision based on the information provided.</p>
      </div>
    </div>
  );
};

export default DecisionForm;
