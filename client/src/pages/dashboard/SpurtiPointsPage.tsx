import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Award, CheckCircle2, Copy, ExternalLink, Gift, GraduationCap, Lock, MessageSquare, Search, ShoppingBag, Ticket } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { RootState } from '../../store/store';
import { useActivityFeed, useDashboardMetrics } from '../../hooks/dashboard/useDashboard';
import { DashboardService, SamagamaPointsSync } from '../../services/dashboard/DashboardService';
import { updateUserPoints, logout } from '../../store/slices/authSlice';
import { AuthService } from '../../services/AuthService';

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
}

interface Redemption {
  id: string;
  title: string;
  cost: number;
  code: string;
  redeemedAt: string;
  used?: boolean;
}

const SAMAGAMA_PORTAL_URL = 'https://samagama.in';

const rewards: Reward[] = [
  {
    id: 'samagama-mentor',
    title: 'Mentor Doubt Pass',
    description: 'Convert points into a Samagama coupon for one priority doubt or mentor clarification.',
    cost: 150,
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    id: 'samagama-learning',
    title: 'Learning Session Credit',
    description: 'Use Spurti points as Samagama credits toward one focused learning session.',
    cost: 220,
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    id: 'samagama-review',
    title: 'Project Review Coupon',
    description: 'Redeem a coupon code for a project review request inside the Samagama portal.',
    cost: 300,
    icon: <Ticket className="h-5 w-5" />,
  },
  {
    id: 'samagama-store',
    title: 'Samagama Store Voucher',
    description: 'Turn points into a small store voucher for participant perks and event goodies.',
    cost: 420,
    icon: <ShoppingBag className="h-5 w-5" />,
  },
];

const earningRules = [
  { label: 'Ask a useful question', points: 15, icon: MessageSquare },
  { label: 'Search knowledge articles', points: 8, icon: Search },
  { label: 'Bookmark a helpful answer', points: 10, icon: Award },
];

const getStoredRedemptions = (storageKey: string): Redemption[] => {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch {
    return [];
  }
};

const getStoredSamagamaSync = (storageKey: string): SamagamaPointsSync | null => {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || 'null');
  } catch {
    return null;
  }
};

const createVoucherCode = (rewardId: string) => {
  const prefix = rewardId
    .replace('samagama-', '')
    .slice(0, 4)
    .toUpperCase();
  return `SPURTI-${prefix}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
};

export const SpurtiPointsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { data: metrics } = useDashboardMetrics();
  const { data: activity } = useActivityFeed();
  const storageKey = `spurti-redemptions-${user?._id || user?.email || 'guest'}`;
  const syncStorageKey = `samagama-spurti-sync-${user?._id || user?.email || 'guest'}`;

  const [redemptions, setRedemptions] = useState<Redemption[]>(() => getStoredRedemptions(storageKey));
  const [samagamaEmail, setSamagamaEmail] = useState(user?.email || '');
  const [samagamaPassword, setSamagamaPassword] = useState('');
  const [samagamaSync, setSamagamaSync] = useState<SamagamaPointsSync | null>(() => getStoredSamagamaSync(syncStorageKey));
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync / Load redemptions from MongoDB
  useEffect(() => {
    const loadBackendRedemptions = async () => {
      try {
        const dbRedemptions = await DashboardService.getUserRedemptions();
        const mapped: Redemption[] = dbRedemptions.map((r: any) => ({
          id: r._id,
          title: r.title,
          cost: r.cost,
          code: r.code,
          redeemedAt: r.redeemedAt || r.createdAt,
          used: r.used
        }));

        // Handle backward compatibility by seeding local storage vouchers to db
        const local = getStoredRedemptions(storageKey);
        const dbCodes = new Set(mapped.map(d => d.code));
        const toSeed = local.filter(l => !dbCodes.has(l.code));

        if (toSeed.length > 0) {
          for (const item of toSeed) {
            try {
              const created = await DashboardService.createUserRedemption(item.title, item.cost, item.code);
              if (item.used) {
                await DashboardService.markRedemptionUsed(created._id);
              }
            } catch (err) {
              console.error('Failed to seed local voucher to backend:', err);
            }
          }
          const reloaded = await DashboardService.getUserRedemptions();
          setRedemptions(reloaded.map((r: any) => ({
            id: r._id,
            title: r.title,
            cost: r.cost,
            code: r.code,
            redeemedAt: r.redeemedAt || r.createdAt,
            used: r.used
          })));
        } else {
          setRedemptions(mapped);
        }
      } catch (error) {
        console.error('Failed to load redemptions from backend:', error);
      }
    };

    if (user) {
      loadBackendRedemptions();
    }
  }, [user, storageKey]);

  const earnedPoints = useMemo(() => {
    const conversationPoints = (metrics?.activeConversations || 0) * 15;
    const bookmarkPoints = (metrics?.bookmarkedAnswers || 0) * 10;
    const activityPoints = (activity?.length || 0) * 8;
    return 250 + conversationPoints + bookmarkPoints + activityPoints;
  }, [activity?.length, metrics?.activeConversations, metrics?.bookmarkedAnswers]);

  const sourcePoints = user?.spurtiPointsSyncedAt && user?.spurtiPoints !== undefined && user?.spurtiPoints !== null
    ? user.spurtiPoints
    : earnedPoints;
  const spentPoints = redemptions.reduce((total, redemption) => total + redemption.cost, 0);
  const balance = user?.spurtiPointsSyncedAt && user?.spurtiPoints !== undefined && user?.spurtiPoints !== null
    ? user.spurtiPoints
    : Math.max(sourcePoints - spentPoints, 0);
  const nextReward = rewards.find((reward) => reward.cost > balance);
  const progressTarget = nextReward?.cost || rewards[rewards.length - 1].cost;
  const progress = Math.min(Math.round((balance / progressTarget) * 100), 100);

  const redeemReward = async (reward: Reward) => {
    if (balance < reward.cost) return;

    const code = createVoucherCode(reward.id);
    try {
      const created = await DashboardService.createUserRedemption(reward.title, reward.cost, code);
      const newRedemption: Redemption = {
        id: created._id,
        title: reward.title,
        cost: reward.cost,
        code: code,
        redeemedAt: new Date().toISOString(),
        used: false
      };

      const updatedRedemptions = [newRedemption, ...redemptions];
      setRedemptions(updatedRedemptions);
      localStorage.setItem(storageKey, JSON.stringify(updatedRedemptions));

      if (user && user.spurtiPoints !== undefined && user.spurtiPoints !== null) {
        dispatch(updateUserPoints({
          points: Math.max(0, user.spurtiPoints - reward.cost),
          syncedAt: user.spurtiPointsSyncedAt
        }));
      }

      toast.success(`${reward.title} redeemed`);
    } catch (err) {
      toast.error('Failed to redeem reward on the server.');
      console.error(err);
    }
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    toast.success('Coupon code copied');
  };

  const handleUseCustomAction = async (redemptionId: string, code: string) => {
    await navigator.clipboard.writeText(code);
    toast.success('Coupon code copied! Opening Samagama...');
    try {
      await DashboardService.markRedemptionUsed(redemptionId);
    } catch (e) {
      console.error('Failed to mark used in DB:', e);
    }

    const updated = redemptions.map(r => r.id === redemptionId ? { ...r, used: true } : r);
    setRedemptions(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setTimeout(() => {
      window.open(SAMAGAMA_PORTAL_URL, '_blank', 'noopener,noreferrer');
    }, 800);
  };

  const syncFromSamagama = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSyncing(true);

    try {
      const sync = await DashboardService.syncSamagamaPoints(samagamaEmail, samagamaPassword);
      setSamagamaSync(sync);
      localStorage.setItem(syncStorageKey, JSON.stringify(sync));
      dispatch(updateUserPoints({ points: sync.points, syncedAt: sync.syncedAt }));
      setSamagamaPassword('');
      toast.success('Samagama Spurti points synced');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to sync Samagama points');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetPoints = async () => {
    if (!window.confirm("Are you sure you want to reset your Spurti points to 0? This will also clear your redemption history. This action cannot be undone.")) {
      return;
    }
    try {
      await DashboardService.resetSpurtiPoints();
      dispatch(updateUserPoints({ points: 0, syncedAt: new Date().toISOString() }));
      setRedemptions([]);
      localStorage.removeItem(storageKey);
      toast.success("Spurti points reset to 0");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to reset points");
    }
  };

  const handleDropoutInternship = async () => {
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to drop out from the internship? This will permanently delete your account and log you out immediately. This action is irreversible!")) {
      return;
    }
    try {
      await AuthService.dropOutInternship();
      toast.success("Successfully dropped out. Logging out...");
      setTimeout(() => {
        dispatch(logout());
      }, 1500);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to drop out from internship");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Spurti Points Wallet</h1>
          <p className="mt-2 max-w-2xl text-gray-500 dark:text-gray-400">
            Treat your Spurti points like Samagama credits. Redeem them for coupons, copy the code, and continue to the Samagama portal.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a href={SAMAGAMA_PORTAL_URL} target="_blank" rel="noopener noreferrer">
            <Button className="w-full gap-2 sm:w-auto">
              <ExternalLink className="h-4 w-4" />
              Open Samagama
            </Button>
          </a>
          <Link to="/ai/chat">
            <Button variant="outline" className="w-full gap-2 sm:w-auto">
              <MessageSquare className="h-4 w-4" />
              Earn More
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Balance</p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-5xl font-extrabold text-gray-900 dark:text-white">{balance}</span>
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">Samagama credits</span>
              </div>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                {samagamaSync
                  ? `Synced from ${samagamaSync.email} on ${new Date(samagamaSync.syncedAt).toLocaleString()}`
                  : 'Connect Samagama to use the exact participant balance.'}
              </p>
            </div>
            <div className="rounded-md bg-primary-50 p-3 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              <Gift className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {nextReward ? `Progress to ${nextReward.title}` : 'All rewards unlocked'}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800">
              <div className="h-2 rounded-full bg-primary-600" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Connect Samagama</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Sign in once to fetch the exact Spurti count for this mail ID. Passwords are sent only to the backend sync request and are not saved.
          </p>
          <form onSubmit={syncFromSamagama} className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Samagama Email</label>
              <input
                type="email"
                value={samagamaEmail}
                onChange={(event) => setSamagamaEmail(event.target.value)}
                required
                className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Samagama Password</label>
              <input
                type="password"
                value={samagamaPassword}
                onChange={(event) => setSamagamaPassword(event.target.value)}
                required
                className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
              />
            </div>
            <Button type="submit" className="w-full gap-2" isLoading={isSyncing}>
              <ExternalLink className="h-4 w-4" />
              Sync Exact Points
            </Button>
          </form>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Currency Rules</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {earningRules.map((rule) => (
            <div key={rule.label} className="flex items-center justify-between gap-3 rounded-md bg-gray-50 p-3 dark:bg-gray-800/70">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                  <rule.icon className="h-4 w-4" />
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{rule.label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">+{rule.points}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Samagama Currency Store</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{redemptions.length} redeemed</p>
        </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {rewards.map((reward) => {
            const canRedeem = balance >= reward.cost;

            return (
              <div key={reward.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                    {reward.icon}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{reward.cost} pts</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-gray-900 dark:text-white">{reward.title}</h3>
                <p className="mt-2 min-h-[60px] text-sm text-gray-500 dark:text-gray-400">{reward.description}</p>
                <Button
                  className="mt-5 w-full gap-2"
                  variant={canRedeem ? 'default' : 'outline'}
                  disabled={!canRedeem}
                  onClick={() => redeemReward(reward)}
                >
                  {canRedeem ? <CheckCircle2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  {canRedeem ? 'Buy with Points' : 'Need More Points'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Redemption History</h2>
        {redemptions.length ? (
          <div className="mt-4 divide-y divide-gray-200 dark:divide-gray-800">
            {redemptions.map((redemption) => (
              <div key={redemption.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{redemption.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Code: <span className="font-semibold text-gray-700 dark:text-gray-200">{redemption.code || 'Pending'}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(redemption.redeemedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">-{redemption.cost} pts</span>
                  {redemption.code && (
                    <button
                      type="button"
                      onClick={() => copyCode(redemption.code)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleUseCustomAction(redemption.id, redemption.code)}
                    className={`text-sm font-semibold ${redemption.used ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-primary-600 hover:text-primary-500 dark:text-primary-400'}`}
                    disabled={!!redemption.used}
                  >
                    {redemption.used ? 'Used' : 'Use'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Redeemed perks will appear here.</p>
        )}
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-6 shadow-sm dark:border-red-900/30 dark:bg-red-950/10">
        <h2 className="text-lg font-bold text-red-900 dark:text-red-400">Danger Zone</h2>
        <p className="mt-2 text-sm text-red-700 dark:text-red-400/80">
          Be careful. These actions are irreversible and will affect your session and/or points balance.
        </p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <Button
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-100 hover:text-red-900 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50"
            onClick={handleResetPoints}
          >
            Reset Spurti Points to 0
          </Button>
          <Button
            variant="default"
            className="bg-red-600 hover:bg-red-700 text-white border-none"
            onClick={handleDropoutInternship}
          >
            Drop Out from Internship
          </Button>
        </div>
      </div>
    </div>
  );
};
