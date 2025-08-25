import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle, Loader2 } from 'lucide-react'
import { submitUserForm, getUserById } from '../lib/supabase/submit-form'
import MatchDisplay from './MatchDisplay'

// Form data interface
interface FormData {
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
  
  // Community interests
  offGridVillage: number
  nomadicTribe: number
  businessStartup: number
  wellnessCenter: number
  spiritualCenter: number
  techHub: number
  startupNation: number
}

export default function SurveyForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [matchData, setMatchData] = useState<any>(null)
  const [pollAttempts, setPollAttempts] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    // Contact info
    email: '',
    firstName: '',
    lastName: '',
    age: null,
    phone: '',
    preferredTimes: [],
    socialLinks: '',
    
    // Free text - all empty strings
    jobCareer: '',
    lifeAchievements: '',
    dreamBuilding: '',
    communitySpace: '',
    coreValues: '',
    qualitiesSeek: '',
    dealBreakers: '',
    skillsAbilities: '',
    
    // All Likert scales default to 5
    startVillage: 5,
    spirituality: 5,
    ambition: 5,
    familyOrientation: 5,
    wealthOrientation: 5,
    teamwork: 5,
    agency: 5,
    preparedness: 5,
    locationFreedom: 5,
    existingCommunity: 5,
    empathy: 5,
    
    // Community interests - all default to 5
    offGridVillage: 5,
    nomadicTribe: 5,
    businessStartup: 5,
    wellnessCenter: 5,
    spiritualCenter: 5,
    techHub: 5,
    startupNation: 5,
  })

  const totalSteps = 6

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.email) {
          alert('Please fill in all required fields: First Name, Last Name, and Email')
          return false
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          alert('Please enter a valid email address')
          return false
        }
        return true
      
      case 2:
        if (!formData.jobCareer || !formData.lifeAchievements || !formData.skillsAbilities) {
          alert('Please fill in all required fields on this page')
          return false
        }
        if (formData.jobCareer.length < 20 || formData.lifeAchievements.length < 20) {
          alert('Please provide more detailed responses (at least 2-3 sentences)')
          return false
        }
        return true
      
      case 3:
        if (!formData.dreamBuilding || !formData.communitySpace) {
          alert('Please fill in all required fields on this page')
          return false
        }
        if (formData.dreamBuilding.length < 20 || formData.communitySpace.length < 20) {
          alert('Please provide more detailed responses (at least 2-3 sentences)')
          return false
        }
        return true
      
      case 5:
        if (!formData.coreValues || !formData.qualitiesSeek || !formData.dealBreakers) {
          alert('Please fill in all required fields on this page')
          return false
        }
        return true
      
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (currentStep !== totalSteps) return
    
    setLoading(true)
    
    try {
      console.log('Submitting form data:', formData)
      
      // Submit to Supabase
      const user = await submitUserForm(formData)
      
      console.log('Form submitted successfully:', user)
      
      // Set up for polling
      setUserId(user.id)
      setSubmitted(true)
      setProcessing(true)
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Error submitting form. Please check the console and try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Poll for matches
  useEffect(() => {
    if (!processing || !userId) return

    const maxAttempts = 20 // 20 attempts * 3 seconds = 1 minute max
    const pollInterval = 3000 // 3 seconds

    const checkForMatches = async () => {
      try {
        const userData = await getUserById(userId)
        console.log('Polling attempt', pollAttempts + 1, 'User data:', userData)

        if (userData.user_matches) {
          console.log('Matches found!', userData.user_matches)
          setMatchData(userData.user_matches)
          setProcessing(false)
        } else if (pollAttempts >= maxAttempts) {
          console.log('Max polling attempts reached')
          setProcessing(false)
          alert('Match calculation is taking longer than expected. Please check back later.')
        } else {
          setPollAttempts(prev => prev + 1)
        }
      } catch (error) {
        console.error('Error polling for matches:', error)
        setProcessing(false)
      }
    }

    const timer = setTimeout(checkForMatches, pollInterval)
    return () => clearTimeout(timer)
  }, [processing, userId, pollAttempts])

  const renderLikertScale = (value: number, onChange: (val: number) => void, leftLabel: string, rightLabel: string) => (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-gray-400">
        <span className="max-w-[140px]">{leftLabel}</span>
        <span className="max-w-[140px] text-right">{rightLabel}</span>
      </div>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`
              flex-1 h-12 rounded-lg font-semibold transition-all
              ${value === num 
                ? 'bg-[#D4AF37] text-black scale-110' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }
            `}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  )

  if (submitted) {
    // Show matches if we have them
    if (matchData) {
      return <MatchDisplay matchData={matchData} />
    }

    // Show processing state
    if (processing) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">Processing Submission</h2>
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700 text-left">
              <div className="space-y-2 font-mono text-sm">
                <div className="text-gray-400">User ID: <span className="text-white">{userId}</span></div>
                <div className="text-gray-400">Status: <span className="text-white">Calculating matches</span></div>
                <div className="text-gray-400">Poll attempts: <span className="text-white">{pollAttempts}/20</span></div>
                <div className="text-gray-400">Next check: <span className="text-white">3 seconds</span></div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Polling database for user_matches field...
            </p>
          </div>
        </div>
      )
    }

    // Fallback submitted state (shouldn't normally reach here)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="max-w-md text-center">
          <CheckCircle className="w-20 h-20 text-[#D4AF37] mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
          <p className="text-gray-300">Your survey has been successfully submitted. We'll be matching you with aligned collaborators soon!</p>
        </div>
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Contact Information
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Let's start with the basics</h2>
              <p className="text-gray-400">We'll use this to create your account and match you with aligned people.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Age *</label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => updateFormData('age', parseInt(e.target.value) || null)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Times to Connect</label>
              <div className="flex gap-3">
                {['Morning', 'Afternoon', 'Evening'].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      const times = formData.preferredTimes.includes(time)
                        ? formData.preferredTimes.filter(t => t !== time)
                        : [...formData.preferredTimes, time]
                      updateFormData('preferredTimes', times)
                    }}
                    className={`
                      flex-1 py-3 px-4 rounded-lg font-medium transition-all
                      ${formData.preferredTimes.includes(time)
                        ? 'bg-[#D4AF37] text-black'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }
                    `}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Social Media Links (optional)</label>
              <textarea
                value={formData.socialLinks}
                onChange={(e) => updateFormData('socialLinks', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                rows={2}
                placeholder="LinkedIn, Twitter, Instagram, etc."
              />
            </div>
          </div>
        )

      case 2: // About You
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Tell us about yourself</h2>
              <p className="text-gray-400">Help us understand who you are and what you've accomplished.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Describe your job / career *
                <span className="text-gray-500 text-xs ml-2">(at least 2-3 sentences)</span>
              </label>
              <textarea
                value={formData.jobCareer}
                onChange={(e) => updateFormData('jobCareer', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                rows={4}
                placeholder="What do you do professionally? What's your background?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Which of your life achievements are you most proud of? *
                <span className="text-gray-500 text-xs ml-2">(at least 2-3 sentences)</span>
              </label>
              <textarea
                value={formData.lifeAchievements}
                onChange={(e) => updateFormData('lifeAchievements', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                rows={4}
                placeholder="What accomplishments define you?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What skills and abilities would you bring to an intentional community? *
                <span className="text-gray-500 text-xs ml-2">(consider both professional and personal abilities)</span>
              </label>
              <textarea
                value={formData.skillsAbilities}
                onChange={(e) => updateFormData('skillsAbilities', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                rows={4}
                placeholder="What unique value can you contribute?"
              />
            </div>
          </div>
        )

      case 3: // Your Vision
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Your dreams and vision</h2>
              <p className="text-gray-400">Share what you're building and working toward.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What is your dream—what are you building and working toward? *
                <span className="text-gray-500 text-xs ml-2">(at least 2-3 sentences)</span>
              </label>
              <textarea
                value={formData.dreamBuilding}
                onChange={(e) => updateFormData('dreamBuilding', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                rows={4}
                placeholder="What is your big vision for the future?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                If you had $100 million to build a community space, what would you create? *
                <span className="text-gray-500 text-xs ml-2">(where would it be, what activities would it focus on?)</span>
              </label>
              <textarea
                value={formData.communitySpace}
                onChange={(e) => updateFormData('communitySpace', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                rows={4}
                placeholder="Describe your ideal community..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Do you want to start a village / new town with your friends?
              </label>
              {renderLikertScale(
                formData.startVillage,
                (val) => updateFormData('startVillage', val),
                'Not interested at all',
                'Deeply committed to building a town'
              )}
            </div>
          </div>
        )

      case 4: // Community Interests
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Community interests</h2>
              <p className="text-gray-400">How interested are you in participating in these types of communities?</p>
            </div>
            
            <div className="space-y-8">
              <div>
                <p className="text-white font-medium mb-3">Self-sustaining village off the grid</p>
                {renderLikertScale(
                  formData.offGridVillage,
                  (val) => updateFormData('offGridVillage', val),
                  'Not interested',
                  'Very interested'
                )}
              </div>
              
              <div>
                <p className="text-white font-medium mb-3">Travel the world with friends as a nomadic tribe</p>
                {renderLikertScale(
                  formData.nomadicTribe,
                  (val) => updateFormData('nomadicTribe', val),
                  'Not interested',
                  'Very interested'
                )}
              </div>
              
              <div>
                <p className="text-white font-medium mb-3">Build a business / start-up with a close-knit team</p>
                {renderLikertScale(
                  formData.businessStartup,
                  (val) => updateFormData('businessStartup', val),
                  'Not interested',
                  'Very interested'
                )}
              </div>
              
              <div>
                <p className="text-white font-medium mb-3">Create a wellness center to promote health and vitality</p>
                {renderLikertScale(
                  formData.wellnessCenter,
                  (val) => updateFormData('wellnessCenter', val),
                  'Not interested',
                  'Very interested'
                )}
              </div>
              
              <div>
                <p className="text-white font-medium mb-3">Build a spiritual center / retreat for spiritual growth</p>
                {renderLikertScale(
                  formData.spiritualCenter,
                  (val) => updateFormData('spiritualCenter', val),
                  'Not interested',
                  'Very interested'
                )}
              </div>
              
              <div>
                <p className="text-white font-medium mb-3">Found a new town to grow a technology hub and create a smart city</p>
                {renderLikertScale(
                  formData.techHub,
                  (val) => updateFormData('techHub', val),
                  'Not interested',
                  'Very interested'
                )}
              </div>
              
              <div>
                <p className="text-white font-medium mb-3">Create a startup nation to build a new society (e.g., a network state)</p>
                {renderLikertScale(
                  formData.startupNation,
                  (val) => updateFormData('startupNation', val),
                  'Not interested',
                  'Very interested'
                )}
              </div>
            </div>
          </div>
        )

      case 5: // Values & Preferences
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Your values and preferences</h2>
              <p className="text-gray-400">Help us understand what matters most to you.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What core values do you want your community to uphold? *
                <span className="text-gray-500 text-xs ml-2">(write three to five core values)</span>
              </label>
              <textarea
                value={formData.coreValues}
                onChange={(e) => updateFormData('coreValues', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                rows={3}
                placeholder="E.g., integrity, innovation, compassion, freedom, sustainability..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What qualities do you seek in close friends and collaborators? *
                <span className="text-gray-500 text-xs ml-2">(at least 2-3 sentences)</span>
              </label>
              <textarea
                value={formData.qualitiesSeek}
                onChange={(e) => updateFormData('qualitiesSeek', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                rows={3}
                placeholder="What traits are most important to you?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What are deal breakers—qualities you do NOT want in close collaborators? *
                <span className="text-gray-500 text-xs ml-2">(at least 2-3 sentences)</span>
              </label>
              <textarea
                value={formData.dealBreakers}
                onChange={(e) => updateFormData('dealBreakers', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                rows={3}
                placeholder="What behaviors or traits are unacceptable?"
              />
            </div>

            <div className="space-y-8">
              <div>
                <p className="text-white font-medium mb-3">Which better describes your attitude about religion?</p>
                {renderLikertScale(
                  formData.spirituality,
                  (val) => updateFormData('spirituality', val),
                  'I do not believe in god or any religion',
                  'God and faith are at the very center of my life'
                )}
              </div>
              
              <div>
                <p className="text-white font-medium mb-3">What best describes your attitude toward family?</p>
                {renderLikertScale(
                  formData.familyOrientation,
                  (val) => updateFormData('familyOrientation', val),
                  'I prioritize personal/career growth over family ties',
                  'Family is the most important thing in my life'
                )}
              </div>
              
              <div>
                <p className="text-white font-medium mb-3">When building something new, what energizes you most?</p>
                {renderLikertScale(
                  formData.teamwork,
                  (val) => updateFormData('teamwork', val),
                  'Working solo in deep focus mode',
                  'Co-creating with a vibrant community'
                )}
              </div>
            </div>
          </div>
        )

      case 6: // Personal Assessment
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Personal assessment</h2>
              <p className="text-gray-400">Last step! Help us understand your mindset and readiness.</p>
            </div>
            
            <div className="space-y-8">
              <div>
                <p className="text-white font-medium mb-3">I am determined to realize extraordinary achievements that change the world and the course of history</p>
                {renderLikertScale(
                  formData.ambition,
                  (val) => updateFormData('ambition', val),
                  'Strongly Disagree',
                  'Strongly Agree'
                )}
              </div>
              
              <div>
                <p className="text-white font-medium mb-3">I am focused on building exceptional wealth</p>
                {renderLikertScale(
                  formData.wealthOrientation,
                  (val) => updateFormData('wealthOrientation', val),
                  'Strongly Disagree',
                  'Strongly Agree'
                )}
              </div>
              
              <div>
                <p className="text-white font-medium mb-3">When reflecting on your life successes and setbacks, what best describes your perspective?</p>
                {renderLikertScale(
                  formData.agency,
                  (val) => updateFormData('agency', val),
                  'Outcomes are largely the result of luck and circumstances',
                  'Outcomes are largely the result of my choices and effort'
                )}
              </div>
              
              <div>
                <p className="text-white font-medium mb-3">If you had to start tomorrow, how prepared are you to lead a new intentional community?</p>
                {renderLikertScale(
                  formData.preparedness,
                  (val) => updateFormData('preparedness', val),
                  'I would need significant training first',
                  'I could immediately lead and teach others'
                )}
              </div>
              
              <div>
                <p className="text-white font-medium mb-3">Do you have location freedom?</p>
                {renderLikertScale(
                  formData.locationFreedom,
                  (val) => updateFormData('locationFreedom', val),
                  'I need to stay in one place',
                  'I can travel anywhere indefinitely'
                )}
              </div>
              
              <div>
                <p className="text-white font-medium mb-3">Do you already have a strong community and/or space (e.g., close-knit collaborators, land)?</p>
                {renderLikertScale(
                  formData.existingCommunity,
                  (val) => updateFormData('existingCommunity', val),
                  'I feel deeply isolated',
                  'I have a strong, well-established community'
                )}
              </div>
              
              <div>
                <p className="text-white font-medium mb-3">When someone disagrees with your approach, which better describes your response?</p>
                {renderLikertScale(
                  formData.empathy,
                  (val) => updateFormData('empathy', val),
                  'Explain why your reasoning is correct',
                  "Get curious about what they're seeing"
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Join <span className="text-[#D4AF37]">Inner Circle</span>
          </h1>
          <p className="text-gray-400">Find your most aligned collaborators in the world</p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-400">
              {currentStep === 1 && 'Contact Info'}
              {currentStep === 2 && 'About You'}
              {currentStep === 3 && 'Your Vision'}
              {currentStep === 4 && 'Community Interests'}
              {currentStep === 5 && 'Values & Preferences'}
              {currentStep === 6 && 'Personal Assessment'}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 mb-6 border border-gray-700">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2
                ${currentStep === 1 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
                }
              `}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-[#D4AF37] hover:bg-[#B8941F] text-black rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] text-black rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    Creating your profile...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Complete & Find Matches
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="max-w-3xl mx-auto mt-8 text-center">
          <p className="text-sm text-gray-500">
            Your responses will be kept private and only used to find your best matches.
            Estimated time: 10-15 minutes.
          </p>
        </div>
      </div>
    </div>
  )
}