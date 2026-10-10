import React, { useState } from 'react';
import { Award, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const EcoChallengeCard = ({ dailyChallenge, onChallengeCompleted }) => {
  const { refreshUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [localDone, setLocalDone] = useState(false);

  const isCompleted = dailyChallenge?.completedToday || localDone;
  const title =
    dailyChallenge?.title || 'Green Commute Day: Take Public Transit, Cycle, or Walk';
  const description =
    dailyChallenge?.description ||
    'Avoid single-occupancy fossil-fuel trips today and complete at least one sustainable commute.';
  const reward = dailyChallenge?.pointsReward ?? 30;
  const savedKg = dailyChallenge?.estimatedCo2SavedKg ?? 3.2;

  const handleCompleteChallenge = async () => {
    if (isCompleted || submitting) return;
    setSubmitting(true);
    try {
      await api.post('/eco-points', {
        actionCode: dailyChallenge?.code || 'CHALLENGE_DAILY_ECO',
        title: `Completed Daily Challenge: ${title}`,
        category: dailyChallenge?.category || 'TRANSPORT',
        points: reward,
        co2SavedKg: savedKg,
      });
      setLocalDone(true);
      await refreshUser();
      if (onChallengeCompleted) onChallengeCompleted();
    } catch (err) {
      setLocalDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-6 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border-emerald-500/30 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>Today’s Eco Challenge</span>
          </div>
          <span className="text-xs font-extrabold text-amber-500 dark:text-amber-400">
            +{reward} Eco Points
          </span>
        </div>

        <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Est. Impact Reduction:{' '}
          <strong className="text-emerald-500 font-bold">~{savedKg} kg CO₂ saved</strong>
        </div>

        {isCompleted ? (
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Challenge Completed (+{reward} pts)</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleCompleteChallenge}
            disabled={submitting}
            className="btn-primary-eco text-xs py-2.5 px-5"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Recording...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>I Completed It</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default EcoChallengeCard;
