import { useState } from 'react'

interface MatchDetails {
  age_penalty: number
  final_score: number
  age_difference: number
  alignment_bonus: number
  base_similarity: number
  opposing_values: string[]
  alignment_issues: string[]
  alignment_penalty: number
  weighted_distance: number
  opposition_penalty: number
  shared_high_interests: string[]
}

interface Match {
  name: string
  email: string
  score: number
  details: MatchDetails
  user_id: string
  shared_interests: string[]
}

interface MatchData {
  matches: Match[]
  calculated_at: string
  above_threshold: number
  total_evaluated: number
  algorithm_version: string
}

interface MatchDisplayProps {
  matchData: MatchData
}

export default function MatchDisplay({ matchData }: MatchDisplayProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const toggleCard = (userId: string) => {
    setExpandedCard(expandedCard === userId ? null : userId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Match Results</h1>
          <p className="text-gray-400 text-lg">
            {matchData.matches.length} matches found
          </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-white">{matchData.matches.length}</div>
              <div className="text-gray-400 text-sm">Total Matches</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{matchData.above_threshold}</div>
              <div className="text-gray-400 text-sm">Above Threshold</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{matchData.total_evaluated}</div>
              <div className="text-gray-400 text-sm">People Evaluated</div>
            </div>
          </div>
        </div>

        {/* Match Cards */}
        <div className="space-y-6">
          {matchData.matches.map((match, index) => (
            <div
              key={match.user_id}
              className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700 overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {index + 1}. {match.name}
                    </h2>
                    <div className="text-gray-400 mb-4">
                      {match.email}
                    </div>
                  </div>
                  
                  {/* Score */}
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">{match.score}</div>
                    <div className="text-sm text-gray-400">Match Score</div>
                  </div>
                </div>

                {/* Basic Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Base Similarity</div>
                    <div className="text-lg font-mono text-white">{match.details.base_similarity}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Alignment Bonus</div>
                    <div className="text-lg font-mono text-white">+{match.details.alignment_bonus}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Age Difference</div>
                    <div className="text-lg font-mono text-white">{match.details.age_difference} years</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Distance Score</div>
                    <div className="text-lg font-mono text-white">{match.details.weighted_distance.toFixed(2)}</div>
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => toggleCard(match.user_id)}
                  className="mt-4 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {expandedCard === match.user_id ? '[ Hide Details ]' : '[ Show Full JSON ]'}
                </button>

                {/* Expanded Details - Full JSON */}
                {expandedCard === match.user_id && (
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap overflow-x-auto">
{JSON.stringify({
  name: match.name,
  email: match.email,
  score: match.score,
  user_id: match.user_id,
  shared_interests: match.shared_interests,
  details: match.details
}, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Algorithm Version: {matchData.algorithm_version}</p>
          <p>Calculated: {new Date(matchData.calculated_at).toISOString()}</p>
        </div>
      </div>
    </div>
  )
}