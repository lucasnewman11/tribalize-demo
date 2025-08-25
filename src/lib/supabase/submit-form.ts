import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client using Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Updated FormData interface to match new survey structure
export interface FormData {
  // Contact info
  email: string
  firstName: string
  lastName: string
  age: number | null
  phone: string
  preferredTimes: string[]
  socialLinks: string
  
  // Free text responses
  jobCareer: string
  lifeAchievements: string
  dreamBuilding: string
  communitySpace: string
  coreValues: string
  qualitiesSeek: string
  dealBreakers: string
  skillsAbilities: string
  
  // Core Likert scales
  startVillage: number
  spirituality: number
  ambition: number
  familyOrientation: number
  wealthOrientation: number
  teamwork: number
  agency: number
  preparedness: number
  locationFreedom: number
  existingCommunity: number
  empathy: number
  
  // Community interests (individual fields now)
  offGridVillage: number
  nomadicTribe: number
  businessStartup: number
  wellnessCenter: number
  spiritualCenter: number
  techHub: number
  startupNation: number
}

export async function submitUserForm(formData: FormData) {
  try {
    // Structure the multiple choice responses (all Likert scales)
    const mcResponses = {
      // Core questions
      start_village: formData.startVillage,
      spirituality: formData.spirituality,
      ambition: formData.ambition,
      family_orientation: formData.familyOrientation,
      wealth_orientation: formData.wealthOrientation,
      teamwork: formData.teamwork,
      agency: formData.agency,
      preparedness: formData.preparedness,
      location_freedom: formData.locationFreedom,
      existing_community: formData.existingCommunity,
      empathy: formData.empathy,
      
      // Community interests
      interest_off_grid: formData.offGridVillage,
      interest_nomadic: formData.nomadicTribe,
      interest_business: formData.businessStartup,
      interest_wellness: formData.wellnessCenter,
      interest_spiritual: formData.spiritualCenter,
      interest_tech_hub: formData.techHub,
      interest_startup_nation: formData.startupNation
    }
    
    // Structure the free text responses
    const freeResponses = {
      job_career: formData.jobCareer,
      life_achievements: formData.lifeAchievements,
      dream_building: formData.dreamBuilding,
      community_space: formData.communitySpace,
      core_values: formData.coreValues,
      qualities_seek: formData.qualitiesSeek,
      deal_breakers: formData.dealBreakers,
      skills_abilities: formData.skillsAbilities
    }
    
    // Complete form responses (everything)
    const formResponses = {
      // Contact info
      preferred_times: formData.preferredTimes,
      
      // All responses combined
      ...mcResponses,
      ...freeResponses,
      
      // Metadata
      survey_version: 2,
      submitted_at: new Date().toISOString()
    }
    
    // Calculate attribute scores based on the new survey
    const attributeScores = {
      // Vision attributes
      seeks_new_community: formData.startVillage,
      seeks_high_tech: formData.techHub,
      seeks_return_to_land: formData.offGridVillage,
      seeks_entrepreneurship: formData.businessStartup,
      seeks_spiritual_community: formData.spiritualCenter,
      seeks_health_fitness: formData.wellnessCenter,
      seeks_travel: formData.nomadicTribe,
      seeks_breakaway_society: formData.startupNation,
      
      // Values attributes
      ambitious: formData.ambition,
      wealth_oriented: formData.wealthOrientation,
      family_oriented: formData.familyOrientation,
      teamwork_oriented: formData.teamwork,
      religious: formData.spirituality,
      
      // Maturity and resources
      high_agency: formData.agency,
      high_skills: formData.preparedness,
      high_empathy: formData.empathy,
      high_location_freedom: formData.locationFreedom,
      high_resources: formData.existingCommunity,
      
      // Derived scores
      readiness_score: (formData.agency + formData.preparedness + formData.locationFreedom) / 3,
      community_interest_avg: (
        formData.offGridVillage + 
        formData.nomadicTribe + 
        formData.businessStartup + 
        formData.wellnessCenter + 
        formData.spiritualCenter + 
        formData.techHub + 
        formData.startupNation
      ) / 7
    }

    // Prepare the data for users_synthetic table
    const userData = {
      // Basic fields
      email: formData.email,
      first_name: formData.firstName,
      last_name: formData.lastName,
      age: formData.age,
      phone: formData.phone,
      social_links: formData.socialLinks,
      
      // JSONB fields
      form_responses: formResponses,
      mc_responses: mcResponses,
      free_responses: freeResponses,
      attribute_scores: attributeScores,
      
      // Quality metrics can be calculated
      quality_metrics: {
        completeness: calculateCompleteness(formData),
        response_length_avg: calculateAvgResponseLength(freeResponses),
        consistency_score: calculateConsistency(mcResponses)
      },
      
      // Status fields
      quality_status: 'pending',
      should_match: false, // Will be set to true after quality review
      status: 'new',
      is_synthetic: false, // This is a real user, not synthetic
      
      // Timestamps handled by database defaults
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert into NEW_TEST_DATABASE table
    const { data, error } = await supabase
      .from('test_users_pool_1') // Using the correct table name
      .insert([userData])
      .select()
      .single()

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(error.message || 'Failed to submit to Supabase');
      }

    console.log('Successfully submitted user data:', data)
    return data
    
  } catch (error) {
    console.error('Error submitting form:', error)
    throw error
  }
}

// Helper function to calculate form completeness
function calculateCompleteness(formData: FormData): number {
  const requiredFields = [
    'email', 'firstName', 'lastName', 'jobCareer', 
    'lifeAchievements', 'dreamBuilding', 'communitySpace',
    'coreValues', 'qualitiesSeek', 'dealBreakers', 'skillsAbilities'
  ]
  
  let filledCount = 0
  requiredFields.forEach(field => {
    if (formData[field as keyof FormData]) filledCount++
  })
  
  return (filledCount / requiredFields.length) * 100
}

// Helper function to calculate average response length
function calculateAvgResponseLength(freeResponses: any): number {
  const lengths = Object.values(freeResponses)
    .filter(val => typeof val === 'string')
    .map(val => (val as string).length)
  
  if (lengths.length === 0) return 0
  return lengths.reduce((a, b) => a + b, 0) / lengths.length
}

// Helper function to check consistency in responses
function calculateConsistency(mcResponses: any): number {
  // Simple consistency check - can be made more sophisticated
  // For now, check if related scores are reasonably aligned
  const consistencyChecks = [
    // If someone wants to start a village, they should have some community interest
    Math.abs(mcResponses.start_village - mcResponses.interest_off_grid) <= 3,
    // If someone is spiritual, spiritual center interest should align
    Math.abs(mcResponses.spirituality - mcResponses.interest_spiritual) <= 3,
    // If someone is entrepreneurial, business interest should align
    Math.abs(mcResponses.ambition - mcResponses.interest_business) <= 3,
  ]
  
  const passedChecks = consistencyChecks.filter(check => check).length
  return (passedChecks / consistencyChecks.length) * 100
}

// Helper function to get user data by ID
export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from('test_users_pool_1')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    throw error
  }

  return data
}

// Helper function to get all real users (not synthetic)
export async function getAllRealUsers() {
  const { data, error } = await supabase
    .from('test_users_pool_1')
    .select('*')
    .eq('is_synthetic', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    throw error
  }

  return data
}

// Helper function to get users ready for matching
export async function getMatchableUsers() {
  const { data, error } = await supabase
    .from('test_users_pool_1')
    .select('*')
    .eq('should_match', true)
    .eq('quality_status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching matchable users:', error)
    throw error
  }

  return data
}